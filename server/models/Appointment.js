const mongoose = require('mongoose');

// Mirrors the original `appointments` table.
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentDate: { type: Date, required: true },
    dayOfWeek: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    prescription: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
