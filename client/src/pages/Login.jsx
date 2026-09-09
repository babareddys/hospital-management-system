import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { patient: 'Patient', doctor: 'Doctor', admin: 'Admin' };

const Login = () => {
  const { role } = useParams(); // 'patient' | 'doctor' | 'admin'
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.username, form.password, role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h2>{ROLE_LABELS[role] || 'User'} Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required />

          <label htmlFor="password">Password:</label>
          <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="form-footer">
          No account? <Link to={`/register/${role}`}>Register as {ROLE_LABELS[role]}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
