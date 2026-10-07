const express = require('express');
const Appointment = require('../models/Appointment');
const DoctorSession = require('../models/DoctorSession');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// @route   POST /api/appointments
// @desc    Patient books an appointment for a chosen doctor/session/date.
//          Validates that the selected date's weekday actually matches the
//          chosen session, then relies on a partial unique index on the
//          Appointment model (doctor + appointmentDate + startTime, scoped
//          to non-cancelled statuses) to make double-booking the same slot
//          impossible even under concurrent requests. A pre-check below
//          gives a friendly message for the common case; the index is the
//          actual guarantee.
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, selectedDate } = req.body;
    if (!doctorId || !dayOfWeek || !startTime || !selectedDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const date = new Date(selectedDate);
    const actualDay = DAYS[date.getDay()];

    if (actualDay !== dayOfWeek) {
      return res.status(400).json({
        message: `The selected date does not match the chosen session day (${dayOfWeek}).`,
      });
    }

    const session = await DoctorSession.findOne({
      doctor: doctorId,
      dayOfWeek,
      startTime,
    });
    if (!session) {
      return res.status(400).json({ message: 'That session no longer exists.' });
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      startTime: session.startTime,
      status: { $in: ['pending', 'completed'] },
    });
    if (existingBooking) {
      return res.status(409).json({
        message: 'That slot has just been booked by someone else. Please pick another time.',
      });
    }

    let appointment;
    try {
      appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        appointmentDate,
        dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        status: 'pending',
      });
    } catch (err) {
      // Race condition: two requests passed the pre-check at the same time.
      // The unique index catches it here.
      if (err.code === 11000) {
        return res.status(409).json({
          message: 'That slot has just been booked by someone else. Please pick another time.',
        });
      }
      throw err;
    }

    res.status(201).json({
      message: `Appointment booked successfully for ${appointmentDate.toLocaleString()}`,
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/appointments/mine
// @desc    Patient: their own appointments
router.get('/mine', protect, authorize('patient'), async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor', 'name specialization')
    .sort('-appointmentDate');
  res.json(appointments);
});

// @route   GET /api/appointments/doctor
// @desc    Doctor: their own appointments
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  const appointments = await Appointment.find({ doctor: req.user._id })
    .populate('patient', 'name username phone')
    .sort('-appointmentDate');
  res.json(appointments);
});

// @route   GET /api/appointments
// @desc    Admin: every appointment in the system
router.get('/', protect, authorize('admin'), async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('doctor', 'name specialization')
    .populate('patient', 'name username phone')
    .sort('-appointmentDate');
  res.json(appointments);
});

// @route   PUT /api/appointments/:id/status
// @desc    Doctor updates status; only allowed while status is 'pending'
router.put('/:id/status', protect, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status change.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your appointment.' });
    }
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        message: `This appointment is already ${appointment.status} and cannot be changed.`,
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: `Appointment updated to ${status}.`, appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/appointments/:id/prescription
// @desc    Doctor writes a prescription and marks the appointment completed
router.put('/:id/prescription', protect, authorize('doctor'), async (req, res) => {
  try {
    const { prescription } = req.body;
    if (!prescription || !prescription.trim()) {
      return res.status(400).json({ message: 'Prescription text is required.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your appointment.' });
    }

    appointment.prescription = prescription.trim();
    appointment.status = 'completed';
    await appointment.save();

    res.json({ message: 'Prescription saved successfully.', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
