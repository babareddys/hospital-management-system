import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusClass = (status) => `status-${status}`;

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container wide">
      <h2><i className="fas fa-calendar-check"></i> My Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialization</th>
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
                <td>{a.doctor?.specialization}</td>
                <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                <td><span className={statusClass(a.status)}>{a.status}</span></td>
                <td>{a.prescription || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />
      <Link to="/patient">Back to Dashboard</Link>
    </div>
  );
};

export default PatientAppointments;
