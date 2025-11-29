import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Hotels from './pages/Catalogue';
import About from './pages/About';
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from './components/AdminRoute';
import EmployeeDashboard from './pages/EmployeeDashboard/index';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/about" element={<About />} />

            {/* Admin dashboard */}
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Employee dashboard */}
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
