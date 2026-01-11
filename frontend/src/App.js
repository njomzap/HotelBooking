import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalogue from './pages/Catalogue';
import About from './pages/About';

import AdminDashboard from "./pages/AdminDashboard/Index";
import EmployeeDashboard from './pages/EmployeeDashboard/index';
import EmployeeHotels from "./pages/EmployeeDashboard/hotels";

import RoomDetail from './pages/RoomDetails';
import HotelDetails from "./pages/HotelDetails";

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels" element={<Catalogue />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/about" element={<About />} />

            {}
            <Route path="/rooms/:id" element={<RoomDetail />} />

            {}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {}
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {}
            <Route
              path="/employee/hotels"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <EmployeeHotels />
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
