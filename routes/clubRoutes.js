const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  getClubByName,
  createClub,
  updateClub,
} = require('../controllers/clubController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/clubs          — public
router.get('/', getAllClubs);

// GET /api/clubs/:name    — public (e.g. /api/clubs/NSS)
router.get('/:name', getClubByName);

// POST /api/clubs         — admin only
router.post('/', protect, adminOnly, createClub);

// PUT /api/clubs/:name    — admin only
router.put('/:name', protect, adminOnly, updateClub);

module.exports = router;