const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Sangamam API is running!' });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error.', error: err.message });
});

// ─── Connect DB then start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
  seedAdmin();
});

// ─── Seed default admin on first run ──────────────────────────────────────────
async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');

  try {
    const exists = await User.findOne({ email: 'admin@annauniv.edu' });
    if (!exists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@annauniv.edu',
        password: 'admin123',
        role: 'admin',
        rollNumber: 'ADMIN001',
        department: 'Administration',
      });
      console.log('👤 Admin seeded → admin@annauniv.edu / admin123');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}