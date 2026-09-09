import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-container">
      <h2><i className="fas fa-user-injured icon"></i>Welcome, {user?.name || user?.username}!</h2>
      <p>View your profile and book appointments.</p>
      <nav>
        <ul>
          <li><Link to="/patient/profile"><i className="fas fa-id-card icon"></i>View Profile</Link></li>
          <li><Link to="/patient/book"><i className="fas fa-calendar-plus icon"></i>Book Appointment</Link></li>
          <li><Link to="/patient/appointments"><i className="fas fa-calendar-check icon"></i>My Appointments</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default PatientDashboard;
