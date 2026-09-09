import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-container">
      <h2><i className="fas fa-user-md icon"></i>Welcome, Dr. {user?.name}</h2>
      <p><i className="fas fa-stethoscope icon"></i>Specialization: {user?.specialization}</p>
      <nav>
        <ul>
          <li><Link to="/doctor/appointments"><i className="fas fa-calendar-check icon"></i>Manage Appointments</Link></li>
          <li><Link to="/doctor/sessions"><i className="fas fa-clock icon"></i>Manage Session Timings</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default DoctorDashboard;
