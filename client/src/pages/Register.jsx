import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { patient: 'Patient', doctor: 'Doctor', admin: 'Admin' };

const initialFormFor = (role) => {
  if (role === 'patient') {
    return { username: '', password: '', confirmPassword: '', name: '', age: '', gender: '', phone: '' };
  }
  if (role === 'doctor') {
    return { username: '', password: '', confirmPassword: '', name: '', specialization: '' };
  }
  return { username: '', password: '', confirmPassword: '' }; // admin
};

const Register = () => {
  const { role } = useParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialFormFor(role));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(role, form);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h2>{ROLE_LABELS[role] || 'User'} Registration</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {role === 'patient' && (
            <>
              <label>Full Name:</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Age:</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} required />

              <label>Gender:</label>
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <label>Phone:</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </>
          )}

          {role === 'doctor' && (
            <>
              <label>Full Name:</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Specialization:</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} required />
            </>
          )}

          <label>Username:</label>
          <input name="username" value={form.username} onChange={handleChange} required />

          <label>Password:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="form-footer">
          Already have an account? <Link to={`/login/${role}`}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
