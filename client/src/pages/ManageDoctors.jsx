import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', specialization: '', username: '', password: '' });
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/doctors').then((res) => setDoctors(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/doctors', form);
      setMessage({ type: 'success', text: res.data.message });
      setForm({ name: '', specialization: '', username: '', password: '' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add doctor' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      const res = await api.delete(`/doctors/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete doctor' });
    }
  };

  return (
    <div className="dashboard-container wide">
      <h2>Manage Doctors</h2>
      {message && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>}

      <form onSubmit={handleAdd} className="inline-form">
        <label>Doctor Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Specialization:</label>
        <input name="specialization" value={form.specialization} onChange={handleChange} required />

        <label>Username (e.g. email):</label>
        <input name="username" value={form.username} onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <button type="submit">Add Doctor</button>
      </form>

      <h3>Existing Doctors</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Username</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.name}</td>
                <td>{doc.specialization}</td>
                <td>{doc.username}</td>
                <td>
                  <button className="link-btn danger" onClick={() => handleDelete(doc._id)}>Delete</button>
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

export default ManageDoctors;
