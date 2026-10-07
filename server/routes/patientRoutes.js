const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients
// @desc    Admin: list all patients
router.get('/', protect, authorize('admin'), async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select(
    'name age gender phone username'
  );
  res.json(patients);
});

// @route   POST /api/patients
// @desc    Admin directly adds a patient with a default password so the
//          patient can log in and change it themselves afterward.
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, age, gender, phone, username } = req.body;
    if (!name || !age || !gender || !phone || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const patient = await User.create({
      username,
      password: 'admin', // default password; patient should change it after first login
      role: 'patient',
      name,
      age,
      gender,
      phone,
    });

    res.status(201).json({
      message: 'Patient and login user created successfully with default password "admin".',
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Admin deletes a patient
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await Appointment.deleteMany({ patient: patient._id });
    await patient.deleteOne();

    res.json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
