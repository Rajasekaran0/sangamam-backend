const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// ─── @route  GET /api/events ──────────────────────────────────────────────────
// ─── @access Public  |  Optional query: ?club=NSS&status=Registration Open
const getAllEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.club) filter.club = req.query.club;
    if (req.query.status) filter.status = req.query.status;

    const events = await Event.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Attach registration count to each event
    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({
          event: event._id,
          status: 'registered',
        });
        return { ...event.toJSON(), registrationCount: count };
      })
    );

    res.json({ events: eventsWithCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch events.' });
  }
};

// ─── @route  GET /api/events/:id ─────────────────────────────────────────────
// ─── @access Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'createdBy',
      'name'
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: 'registered',
    });

    res.json({ event: { ...event.toJSON(), registrationCount } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event.' });
  }
};

// ─── @route  POST /api/events ────────────────────────────────────────────────
// ─── @access Admin only
const createEvent = async (req, res) => {
  try {
    const { title, club, description, date, time, location, status, type } =
      req.body;

    if (!title || !club || !description || !date || !location) {
      return res.status(400).json({
        message: 'Title, club, description, date, and location are required.',
      });
    }

    const event = await Event.create({
      title,
      club,
      description,
      date,
      time: time || 'TBD',
      location,
      status: status || 'Upcoming',
      type: type || 'General',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Event created successfully!', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event.' });
  }
};

// ─── @route  PUT /api/events/:id ─────────────────────────────────────────────
// ─── @access Admin only
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Event updated!', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event.' });
  }
};

// ─── @route  DELETE /api/events/:id ──────────────────────────────────────────
// ─── @access Admin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Also delete all registrations for this event
    await Registration.deleteMany({ event: req.params.id });

    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event.' });
  }
};

// ─── @route  GET /api/events/admin/stats ─────────────────────────────────────
// ─── @access Admin only
const getAdminStats = async (req, res) => {
  try {
    const [
      totalMembers,
      activeEvents,
      totalRegistrations,
      nssCount,
      nsoCount,
      yrcCount,
      nccCount,
      recentMembers,
      upcomingEvents,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Event.countDocuments({
        status: { $in: ['Registration Open', 'Registration Closes Soon', 'Upcoming'] },
      }),
      Registration.countDocuments({ status: 'registered' }),
      User.countDocuments({ club: 'NSS', role: 'student' }),
      User.countDocuments({ club: 'NSO', role: 'student' }),
      User.countDocuments({ club: 'YRC', role: 'student' }),
      User.countDocuments({ club: 'NCC', role: 'student' }),
      User.find({ role: 'student' })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
      Event.find({
        status: { $in: ['Registration Open', 'Registration Closes Soon', 'Upcoming'] },
      })
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    // Get registration counts for each upcoming event
    const eventsWithCount = await Promise.all(
      upcomingEvents.map(async (event) => {
        const count = await Registration.countDocuments({
          event: event._id,
          status: 'registered',
        });
        return { ...event.toJSON(), registrationCount: count };
      })
    );

    res.json({
      stats: {
        totalMembers,
        activeEvents,
        totalClubs: 4,
        totalRegistrations,
      },
      clubDistribution: [
        { name: 'NSS', count: nssCount },
        { name: 'NSO', count: nsoCount },
        { name: 'YRC', count: yrcCount },
        { name: 'NCC', count: nccCount },
      ],
      recentMembers,
      upcomingEvents: eventsWithCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch admin stats.' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminStats,
};