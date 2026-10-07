const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorSession = require('../models/DoctorSession');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// @route   POST /api/auth/register/patient
// @desc    Register a new patient
router.post('/register/patient', async (req, res) => {
  try {
    const { username, password, confirmPassword, name, age, gender, phone } = req.body;

    if (!username || !password || !name || !age || !gender || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      username,
      password,
      role: 'patient',
      name,
      age,
      gender,
      phone,
    });

    return res.status(201).json({
      message: 'Patient registration successful!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/register/doctor
// @desc    Register a new doctor + seed default weekly sessions
//          Also seeds a default weekly schedule for the new doctor
//          so they're immediately bookable.
router.post('/register/doctor', async (req, res) => {
  try {
    const { username, password, confirmPassword, name, specialization } = req.body;

    if (!username || !password || !name || !specialization) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      username,
      password,
      role: 'doctor',
      name,
      specialization,
    });

    // Seed default session timings for every day of the week
    // Default template: Mon-Sat, 09:00-12:00 and 14:00-15:00.
    const sessionDocs = [];
    DAYS.forEach((day) => {
      sessionDocs.push({
        doctor: user._id,
        dayOfWeek: day,
        sessionNumber: 1,
        startTime: '09:00',
        endTime: '12:00',
      });
      sessionDocs.push({
        doctor: user._id,
        dayOfWeek: day,
        sessionNumber: 2,
        startTime: '14:00',
        endTime: '15:00',
      });
    });
    await DoctorSession.insertMany(sessionDocs);

    return res.status(201).json({
      message: 'Doctor registration successful!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/register/admin
// @desc    Register a new admin.
//          Locked down for real RBAC: this only succeeds in one of two
//          cases —
//            1) Bootstrap: no admin account exists yet anywhere in the
//               system, so the very first admin can self-register.
//            2) Invite: the request carries a valid admin's JWT in the
//               Authorization header, i.e. an existing admin is creating
//               another one.
//          Any other caller gets a 403, so a random user can never mint
//          themselves an admin account.
router.post('/register/admin', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount > 0) {
      // Not the first admin anymore — require an authenticated admin caller.
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

      if (!token) {
        return res.status(403).json({
          message: 'An admin account already exists. Only an existing admin can create another admin.',
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
          return res.status(403).json({ message: 'Only an existing admin can create another admin.' });
        }
      } catch (err) {
        return res.status(403).json({ message: 'Only an existing admin can create another admin.' });
      }
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({ username, password, role: 'admin' });

    return res.status(201).json({
      message: 'Admin registration successful!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login for any role. Optionally pass `role` to enforce it matches
//          Optionally pass `role` to enforce the login is for that specific
//          role (patient/doctor/admin).
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials or not a ${role}!` });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get the logged-in user's own profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
