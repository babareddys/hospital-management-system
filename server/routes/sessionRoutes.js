const express = require('express');
const DoctorSession = require('../models/DoctorSession');
const User = require('../models/User');
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

// @route   GET /api/doctors/:doctorId/sessions
// @desc    Public: get all session timings for a doctor, grouped by day
//          (mirrors session_timings.php + the sessions table used in
//          book_appointment.php)
router.get('/doctors/:doctorId/sessions', async (req, res) => {
  try {
    const sessions = await DoctorSession.find({ doctor: req.params.doctorId }).sort(
      'sessionNumber'
    );
    // group + order by weekday for a friendlier response
    const grouped = DAYS.map((day) => ({
      dayOfWeek: day,
      sessions: sessions
        .filter((s) => s.dayOfWeek === day)
        .map((s) => ({
          _id: s._id,
          sessionNumber: s.sessionNumber,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
    }));
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/doctors/:doctorId/sessions/:day
// @desc    Doctor edits their own two sessions for a given weekday
//          (mirrors edit_session.php)
router.put(
  '/doctors/:doctorId/sessions/:day',
  protect,
  authorize('doctor'),
  async (req, res) => {
    try {
      const { doctorId, day } = req.params;
      if (req.user._id.toString() !== doctorId) {
        return res.status(403).json({ message: 'You can only edit your own sessions' });
      }
      if (!DAYS.includes(day)) {
        return res.status(400).json({ message: 'Invalid day of week' });
      }

      const { startTime1, endTime1, startTime2, endTime2 } = req.body;

      await DoctorSession.findOneAndUpdate(
        { doctor: doctorId, dayOfWeek: day, sessionNumber: 1 },
        { startTime: startTime1, endTime: endTime1 },
        { upsert: true }
      );
      await DoctorSession.findOneAndUpdate(
        { doctor: doctorId, dayOfWeek: day, sessionNumber: 2 },
        { startTime: startTime2, endTime: endTime2 },
        { upsert: true }
      );

      res.json({ message: 'Session timings updated.' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
