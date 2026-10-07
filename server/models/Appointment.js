const mongoose = require('mongoose');

// One appointment slot booking against a doctor's schedule.
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

// Prevents double-booking the same doctor/date/time slot at the database
// level. Scoped to non-cancelled statuses (via partialFilterExpression) so
// a cancelled appointment frees the slot up for someone else to book again.
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'completed'] } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
