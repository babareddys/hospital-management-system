import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a page and only renders it if the logged-in user has one of the
// allowed roles; otherwise redirects to the right login page.
// Usage: <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;

  if (!user) return <Navigate to="/login/patient" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
