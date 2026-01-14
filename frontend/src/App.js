import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

import Hotels from "./pages/AdminDashboard/Hotels";
import Catalogue from './pages/Catalogue'; 
import HotelDetails from "./pages/HotelDetails";
import RoomDetail from './pages/RoomDetails';

import AdminDashboard from "./pages/AdminDashboard/Index";
import EmployeeDashboard from './pages/EmployeeDashboard/index';
import EmployeeHotels from "./pages/EmployeeDashboard/hotels";

import ProtectedRoute from './components/ProtectedRoute';
import LostFound from "./pages/LostFound";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            {/* Hotels / Catalogue */}
            <Route path="/hotels" element={<Hotels />} />          {/* Admin only */}
            <Route path="/catalogue" element={<Catalogue />} />   {/* Public catalogue page */}
            <Route path="/hotels/:id" element={<HotelDetails />} />

            {/* Rooms */}
            <Route path="/rooms/:id" element={<RoomDetail />} />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/hotels"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <EmployeeHotels />
                </ProtectedRoute>
              }
            />

            {/* Lost & Found for Employees */}
<Route
  path="/employee/lostfound"
  element={
    <ProtectedRoute allowedRoles={["admin", "employee"]}>
      <LostFound />
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
