const express = require('express');
const User = require('../models/User');
const DoctorSession = require('../models/DoctorSession');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

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

// @route   GET /api/doctors
// @desc    Public list of all doctors (used by the "Book Appointment" page,
//          mirrors the doctor dropdown in book_appointment.php)
router.get('/', async (req, res) => {
  const doctors = await User.find({ role: 'doctor' }).select(
    'name specialization username'
  );
  res.json(doctors);
});

// @route   GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select(
    'name specialization username'
  );
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

// @route   POST /api/doctors
// @desc    Admin directly adds a doctor + seeds default session timings
//          (mirrors the "Add Doctor" form in manage_doctors.php)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, specialization, username, password } = req.body;
    if (!name || !specialization || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const doctor = await User.create({
      username,
      password,
      role: 'doctor',
      name,
      specialization,
    });

    const sessionDocs = [];
    DAYS.forEach((day) => {
      sessionDocs.push({
        doctor: doctor._id,
        dayOfWeek: day,
        sessionNumber: 1,
        startTime: '09:00',
        endTime: '12:00',
      });
      sessionDocs.push({
        doctor: doctor._id,
        dayOfWeek: day,
        sessionNumber: 2,
        startTime: '14:00',
        endTime: '15:00',
      });
    });
    await DoctorSession.insertMany(sessionDocs);

    res.status(201).json({ message: 'Doctor added successfully with default timings.', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/doctors/:id
// @desc    Admin deletes a doctor, their sessions, and their appointments
//          (mirrors the delete logic in manage_doctors.php)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await DoctorSession.deleteMany({ doctor: doctor._id });
    await Appointment.deleteMany({ doctor: doctor._id });
    await doctor.deleteOne();

    res.json({ message: 'Doctor deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
