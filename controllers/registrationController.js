const Registration = require('../models/Registration');
const Event = require('../models/Event');

// ─── @route  POST /api/registrations/:eventId ────────────────────────────────
// ─── @access Private (student)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.status === 'Completed' || event.status === 'Cancelled') {
      return res
        .status(400)
        .json({ message: 'Registrations are closed for this event.' });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
    });

    if (existing && existing.status === 'registered') {
      return res
        .status(400)
        .json({ message: 'You are already registered for this event.' });
    }

    // If previously cancelled, re-activate
    if (existing && existing.status === 'cancelled') {
      existing.status = 'registered';
      existing.registeredAt = Date.now();
      await existing.save();

      const count = await Registration.countDocuments({
        event: req.params.eventId,
        status: 'registered',
      });

      return res.json({
        message: 'Successfully re-registered for the event!',
        registration: existing,
        registrationCount: count,
      });
    }

    // New registration
    const registration = await Registration.create({
      user: req.user._id,
      event: req.params.eventId,
    });

    const count = await Registration.countDocuments({
      event: req.params.eventId,
      status: 'registered',
    });

    res.status(201).json({
      message: 'Successfully registered for the event!',
      registration,
      registrationCount: count,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'You are already registered for this event.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Registration failed.' });
  }
};

// ─── @route  DELETE /api/registrations/:eventId ──────────────────────────────
// ─── @access Private (student)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'registered',
    });

    if (!registration) {
      return res
        .status(404)
        .json({ message: 'No active registration found for this event.' });
    }

    registration.status = 'cancelled';
    await registration.save();

    const count = await Registration.countDocuments({
      event: req.params.eventId,
      status: 'registered',
    });

    res.json({
      message: 'Registration cancelled successfully.',
      registrationCount: count,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel registration.' });
  }
};

// ─── @route  GET /api/registrations/my ───────────────────────────────────────
// ─── @access Private (student) — get my registered events
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: 'registered',
    }).populate('event');

    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your registrations.' });
  }
};

// ─── @route  GET /api/registrations/event/:eventId ───────────────────────────
// ─── @access Admin only — get all registrations for an event
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
      status: 'registered',
    }).populate('user', 'name email club rollNumber department');

    res.json({
      registrations,
      count: registrations.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch event registrations.' });
  }
};

// ─── @route  GET /api/registrations/check/:eventId ───────────────────────────
// ─── @access Private — check if current user is registered for an event
const checkRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'registered',
    });

    res.json({ isRegistered: !!registration });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check registration.' });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  checkRegistration,
};