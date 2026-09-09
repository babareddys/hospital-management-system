import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Combines the original appointments.php (list), edit_appointment.php
// (status change) and prescription.php (write prescription) into one
// doctor-facing page with inline actions.
const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({}); // appointmentId -> prescription text draft
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/appointments/doctor')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setNotice('');
    try {
      const res = await api.put(`/appointments/${id}/status`, { status });
      setNotice(res.data.message);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const savePrescription = async (id) => {
    const text = drafts[id];
    if (!text || !text.trim()) {
      setNotice('Prescription text is required.');
      return;
    }
    setBusyId(id);
    setNotice('');
    try {
      const res = await api.put(`/appointments/${id}/prescription`, { prescription: text });
      setNotice(res.data.message);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-container wide">
      <h2><i className="fas fa-calendar-check"></i> Doctor Appointments</h2>
      {notice && <p className="hint">{notice}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Prescription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={5}>No appointments found.</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.patient?.name || a.patient?.username}</td>
                <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                <td><span className={`status-${a.status}`}>{a.status}</span></td>
                <td>
                  {a.status === 'pending' ? (
                    <textarea
                      rows={2}
                      placeholder="Enter prescription..."
                      value={drafts[a._id] ?? ''}
                      onChange={(e) => setDrafts({ ...drafts, [a._id]: e.target.value })}
                    />
                  ) : (
                    a.prescription || '—'
                  )}
                </td>
                <td>
                  {a.status === 'pending' ? (
                    <div className="action-buttons">
                      <button disabled={busyId === a._id} onClick={() => savePrescription(a._id)}>
                        Save Prescription
                      </button>
                      <button disabled={busyId === a._id} onClick={() => updateStatus(a._id, 'completed')}>
                        Mark Completed
                      </button>
                      <button
                        className="btn-danger"
                        disabled={busyId === a._id}
                        onClick={() => updateStatus(a._id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <em>No actions</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />
      <Link to="/doctor">Back to Dashboard</Link>
    </div>
  );
};

export default DoctorAppointments;
