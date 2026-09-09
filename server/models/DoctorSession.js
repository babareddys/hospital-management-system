const mongoose = require('mongoose');

// Mirrors the original `doctor_sessions` table: each doctor has up to two
// sessions per weekday (morning/afternoon), used to build the "available
// slots" a patient can pick from when booking.
const doctorSessionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    sessionNumber: { type: Number, enum: [1, 2], required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "12:00"
  },
  { timestamps: true }
);

doctorSessionSchema.index(
  { doctor: 1, dayOfWeek: 1, sessionNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('DoctorSession', doctorSessionSchema);
