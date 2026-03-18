const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  checkRegistration,
} = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET  /api/registrations/my                — my registrations (student)
router.get('/my', protect, getMyRegistrations);

// GET  /api/registrations/event/:eventId    — all registrants for event (admin)
router.get('/event/:eventId', protect, adminOnly, getEventRegistrations);

// GET  /api/registrations/check/:eventId   — check if I'm registered
router.get('/check/:eventId', protect, checkRegistration);

// POST /api/registrations/:eventId          — register for event (student)
router.post('/:eventId', protect, registerForEvent);

// DELETE /api/registrations/:eventId        — cancel registration (student)
router.delete('/:eventId', protect, cancelRegistration);

module.exports = router;