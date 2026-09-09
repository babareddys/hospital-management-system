import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container admin">
      <h2>Welcome, Admin!</h2>
      <nav>
        <ul>
          <li><Link to="/admin/doctors"><i className="fas fa-user-md icon"></i>Manage Doctors</Link></li>
          <li><Link to="/admin/patients"><i className="fas fa-user-injured icon"></i>Manage Patients</Link></li>
          <li><Link to="/admin/appointments"><i className="fas fa-calendar-check icon"></i>Manage Appointments</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard;
