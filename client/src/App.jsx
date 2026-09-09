import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import PatientDashboard from './pages/PatientDashboard';
import ViewProfile from './pages/ViewProfile';
import BookAppointment from './pages/BookAppointment';
import PatientAppointments from './pages/PatientAppointments';

import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import SessionTimings from './pages/SessionTimings';

import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManagePatients from './pages/ManagePatients';
import ManageAppointments from './pages/ManageAppointments';

function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />

          {/* Patient */}
          <Route
            path="/patient"
            element={
              <PrivateRoute roles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <PrivateRoute roles={['patient']}>
                <ViewProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/book"
            element={
              <PrivateRoute roles={['patient']}>
                <BookAppointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <PrivateRoute roles={['patient']}>
                <PatientAppointments />
              </PrivateRoute>
            }
          />

          {/* Doctor */}
          <Route
            path="/doctor"
            element={
              <PrivateRoute roles={['doctor']}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <PrivateRoute roles={['doctor']}>
                <DoctorAppointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/sessions"
            element={
              <PrivateRoute roles={['doctor']}>
                <SessionTimings />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <PrivateRoute roles={['admin']}>
                <ManageDoctors />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <PrivateRoute roles={['admin']}>
                <ManagePatients />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <PrivateRoute roles={['admin']}>
                <ManageAppointments />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
