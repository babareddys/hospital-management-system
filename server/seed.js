// Optional: seeds the database with data equivalent to the original
// user_db.sql sample rows, so you can log in and explore immediately.
//
// Usage: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const DoctorSession = require('./models/DoctorSession');
const Appointment = require('./models/Appointment');

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    DoctorSession.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  const admin = await User.create({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
  });

  const doctor = await User.create({
    username: 'harsha',
    password: 'doctor123',
    role: 'doctor',
    name: 'Harsha Vardhan',
    specialization: 'Gynacologist',
  });

  const patient = await User.create({
    username: 'ramu',
    password: 'patient123',
    role: 'patient',
    name: 'Ramesh',
    age: 23,
    gender: 'Male',
    phone: '9087958394',
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

  console.log('Seed complete. Sample logins:');
  console.log('  admin   / admin123   (role: admin)');
  console.log('  harsha  / doctor123  (role: doctor)');
  console.log('  ramu    / patient123 (role: patient)');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
