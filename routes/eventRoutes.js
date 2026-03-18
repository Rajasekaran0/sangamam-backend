const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminStats,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/events/admin/stats   — admin only (must be before /:id)
router.get('/admin/stats', protect, adminOnly, getAdminStats);

// GET /api/events               — public
router.get('/', getAllEvents);

// GET /api/events/:id           — public
router.get('/:id', getEventById);

// POST /api/events              — admin only
router.post('/', protect, adminOnly, createEvent);

// PUT /api/events/:id           — admin only
router.put('/:id', protect, adminOnly, updateEvent);

// DELETE /api/events/:id        — admin only
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;