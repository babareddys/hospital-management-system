import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-hero">
      <h1>Welcome to the Hospital Management System</h1>
      <p>Book appointments, manage patients and doctors, and track prescriptions — all in one place.</p>

      <div className="home-grid">
        <div className="home-card">
          <i className="fas fa-user-injured"></i>
          <h3>Patients</h3>
          <p>Book appointments with doctors and view your profile.</p>
          <Link className="btn" to="/login/patient">Patient Login</Link>
          <Link className="btn btn-outline" to="/register/patient">Register</Link>
        </div>
        <div className="home-card">
          <i className="fas fa-user-md"></i>
          <h3>Doctors</h3>
          <p>Manage your appointments, session timings, and prescriptions.</p>
          <Link className="btn" to="/login/doctor">Doctor Login</Link>
          <Link className="btn btn-outline" to="/register/doctor">Register</Link>
        </div>
        <div className="home-card">
          <i className="fas fa-user-shield"></i>
          <h3>Admin</h3>
          <p>Manage doctors, patients, and all appointments.</p>
          <Link className="btn" to="/login/admin">Admin Login</Link>
          <Link className="btn btn-outline" to="/register/admin">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
