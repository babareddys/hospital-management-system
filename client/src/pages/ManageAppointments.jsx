import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Admin's read-only, system-wide view of every appointment.
const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments').then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container wide">
      <h2>Admin Appointment Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Prescription</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={5}>No appointments found.</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.doctor?.name}</td>
                <td>{a.patient?.name || a.patient?.username}</td>
                <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                <td><span className={`status-${a.status}`}>{a.status}</span></td>
                <td>{a.status === 'pending' ? '' : a.prescription || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />
      <Link to="/admin">Back to Dashboard</Link>
    </div>
  );
};

export default ManageAppointments;
