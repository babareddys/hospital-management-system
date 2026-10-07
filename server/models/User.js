const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// A single collection covering all three account roles: patient, doctor,
// admin. Role-specific fields are optional depending on role — this keeps
// auth, profile, and role data together in one document instead of
// spreading them across separate collections joined by a foreign key.
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
      default: 'patient',
    },

    // ----- Patient-specific fields -----
    name: { type: String, trim: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, trim: true },

    // ----- Doctor-specific fields -----
    specialization: { type: String, trim: true },
  },
  { timestamps: true }
);

// Hash password before saving, only if it changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never leak password hash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
