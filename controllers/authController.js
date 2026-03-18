const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: user response object ────────────────────────────────────────────
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  club: user.club,
  rollNumber: user.rollNumber,
  department: user.department,
});

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, club, rollNumber, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !club) {
      return res
        .status(400)
        .json({ message: 'Name, email, password, and club are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'An account with this email already exists.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      club,
      rollNumber: rollNumber || '',
      department: department || '',
      role: 'student',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful! Welcome to Sangamam.',
      token,
      user: userResponse(user),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
// ─── @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private (requires token)
const getMe = async (req, res) => {
  try {
    res.json({ user: userResponse(req.user) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user.' });
  }
};

module.exports = { registerUser, loginUser, getMe };