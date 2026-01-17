import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Navbars & Footer
import Navbar from './components/Navbar';
import UserNavbar from './components/UserNavbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

// Simple User Pages (default exports)
import SimpleUserDashboard from './pages/SimpleUserDashboard/Indexx';
import Bookings from './pages/SimpleUserDashboard/bookingss';
import HotelsUser from './pages/SimpleUserDashboard/hotelss';
import Profile from './pages/SimpleUserDashboard/profilee';
import LostFoundUser from './pages/SimpleUserDashboard/lostAndFound';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard/Index';
import HotelsAdmin from './pages/AdminDashboard/Hotels';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard/index';
import EmployeeHotels from './pages/EmployeeDashboard/hotels';
import LostFoundEmployee from './pages/LostFound';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        
        {role === 'user' ? <UserNavbar setRole={setRole} /> : <Navbar setRole={setRole} />}

        <main className="flex-grow">
          <Routes>
         
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <HotelsAdmin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/hotels"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <EmployeeHotels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/lostfound"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <LostFoundEmployee />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <SimpleUserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/hotels"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <HotelsUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/bookings"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/lostfound"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <LostFoundUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
