import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'doctor'
      ? '/doctor'
      : '/patient';

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <i className="fas fa-hospital"></i> Hospital Management System
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to={dashboardPath}>Dashboard</Link>
            <span className="nav-user">
              <i className="fas fa-user-circle"></i> {user.username} ({user.role})
            </span>
            <button className="link-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login/patient">Patient Login</Link>
            <Link to="/login/doctor">Doctor Login</Link>
            <Link to="/login/admin">Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
