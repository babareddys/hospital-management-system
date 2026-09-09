import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', age: '', gender: '', phone: '', username: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/patients').then((res) => setPatients(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/patients', form);
      setMessage({ type: 'success', text: res.data.message });
      setForm({ name: '', age: '', gender: '', phone: '', username: '' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add patient' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      const res = await api.delete(`/patients/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete patient' });
    }
  };

  return (
    <div className="dashboard-container wide">
      <h2>Manage Patients</h2>
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>
      )}

      <form onSubmit={handleAdd} className="inline-form">
        <label>Patient Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Age</label>
        <input type="number" name="age" value={form.age} onChange={handleChange} required />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Contact Number</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} required />

        <button type="submit">Add Patient</button>
        <p className="hint">New patients get the default password "admin".</p>
      </form>

      <h3>Existing Patients</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td>{p.username}</td>
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.phone}</td>
                <td>
                  <button className="link-btn danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
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

export default ManagePatients;
