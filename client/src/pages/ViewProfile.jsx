import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ViewProfile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <h2>Patient Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>Age:</strong> {user.age}</p>
      <p><strong>Phone Number:</strong> {user.phone}</p>
      <p><strong>Username:</strong> {user.username}</p>

      <Link to="/patient">Back to Dashboard</Link>
    </div>
  );
};

export default ViewProfile;
