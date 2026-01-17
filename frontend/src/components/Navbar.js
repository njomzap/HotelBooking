import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ setRole }) {
  const navigate = useNavigate();
  const [role, setLocalRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    setLocalRole(savedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLocalRole(null);
    if (setRole) setRole(null);
    navigate("/login");
  };

  const showLogout = role === "admin" || role === "employee";

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="StayEase Logo" className="w-8 h-8 rounded-lg"/>
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>

        <ul className="hidden md:flex items-center gap-10 text-gray-700 text-md">
          {!showLogout && (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalogue">Hotels</Link></li>
              <li><Link to="/about">About</Link></li>
            </>
          )}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {showLogout ? (
            <button onClick={handleLogout} className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition">Logout</button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 border border-orange-500 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
