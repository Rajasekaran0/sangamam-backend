const Club = require('../models/Club');
const User = require('../models/User');

// ─── @route  GET /api/clubs ───────────────────────────────────────────────────
// ─── @access Public
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({ name: 1 });
    res.json({ clubs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clubs.' });
  }
};

// ─── @route  GET /api/clubs/:name ────────────────────────────────────────────
// ─── @access Public
const getClubByName = async (req, res) => {
  try {
    const club = await Club.findOne({
      name: req.params.name.toUpperCase(),
    });

    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    // Get member count for this club
    const memberCount = await User.countDocuments({
      club: club.name,
      role: 'student',
    });

    res.json({ club: { ...club.toJSON(), memberCount } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch club.' });
  }
};

// ─── @route  POST /api/clubs ──────────────────────────────────────────────────
// ─── @access Admin only
const createClub = async (req, res) => {
  try {
    const existing = await Club.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: 'Club already exists.' });
    }

    const club = await Club.create(req.body);
    res.status(201).json({ message: 'Club created!', club });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create club.' });
  }
};

// ─── @route  PUT /api/clubs/:name ────────────────────────────────────────────
// ─── @access Admin only
const updateClub = async (req, res) => {
  try {
    const club = await Club.findOneAndUpdate(
      { name: req.params.name.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    res.json({ message: 'Club updated!', club });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update club.' });
  }
};

module.exports = { getAllClubs, getClubByName, createClub, updateClub };