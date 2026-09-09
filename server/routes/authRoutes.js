const express = require('express');
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
// @desc    Register a new patient (mirrors patient_register.php)
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
//          (mirrors doctor_register.php + the default session logic
//          from manage_doctors.php)
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
    // (Mon-Sat 09:00-12:00 & 14:00-15:00), same defaults as the PHP version.
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
// @desc    Register a new admin (mirrors admin_register.php)
//          NOTE: in production, lock this behind an existing-admin check or
//          a setup-only flag; the original PHP left it open too, but this is
//          a good place to tighten security when you deploy for real.
router.post('/register/admin', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
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
//          (mirrors the separate patient_login.php / doctor_login.php /
//          admin_login.php, unified into one endpoint).
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
// @desc    Get the logged-in user's own profile (mirrors view_profile.php)
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
