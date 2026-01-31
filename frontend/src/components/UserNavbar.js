import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function UserNavbar({ setRole }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    console.log('🗑️ USER LOGOUT INITIATED - Starting logout process');
    
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    // Log logout attempt
    console.log('🗑️ USER LOGOUT INITIATED:');
    console.log('Access Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    console.log('Role:', role);
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    console.log('🔍 Before logout - localStorage state:', {
      token: localStorage.getItem("token"),
      accessToken: localStorage.getItem("accessToken"),
      userId: localStorage.getItem("userId"),
      role: localStorage.getItem("role")
    });
    
    try {
      console.log('🚪 Calling authService.logout()...');
      authService.logout(); // Use our new authService
      console.log('✅ authService.logout() completed');
      
      console.log('🔍 After logout - localStorage state:', {
        token: localStorage.getItem("token"),
        accessToken: localStorage.getItem("accessToken"),
        userId: localStorage.getItem("userId"),
        role: localStorage.getItem("role")
      });
      
      console.log('✅ USER LOGOUT SUCCESSFUL');
      if (setRole) setRole(null);
      navigate("/login");
    } catch (error) {
      console.error('❌ USER LOGOUT ERROR:', error);
      // Fallback
      if (setRole) setRole(null);
      navigate("/login");
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="StayEase Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-semibold">BookYourStay</h1>
        </div>

        <ul className="hidden md:flex items-center gap-6 text-gray-700">
          {/* Change Home link to user dashboard */}
          <li>
            <Link to="/user-dashboard" className="hover:text-orange-500 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/hotels" className="hover:text-orange-500 transition">
              Hotels
            </Link>
          </li>
          <li>
            <Link to="/user/bookings" className="hover:text-orange-500 transition">
              Bookings
            </Link>
          </li>
          <li>
            <Link to="/user/profile" className="hover:text-orange-500 transition">
              Profile
            </Link>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? "X" : "☰"}
        </button>
      </div>

      {open && (
        <ul className="md:hidden bg-white shadow-md px-6 pb-4 flex flex-col gap-4">
          <li>
            <Link to="/user-dashboard" onClick={() => setOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/user/hotels" onClick={() => setOpen(false)}>
              Hotels
            </Link>
          </li>
          <li>
            <Link to="/user/bookings" onClick={() => setOpen(false)}>
              Bookings
            </Link>
          </li>
          <li>
            <Link to="/user/lostfound" onClick={() => setOpen(false)}>
              Lost & Found
            </Link>
          </li>
          <li>
            <Link to="/user/profile" onClick={() => setOpen(false)}>
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={() => { handleLogout(); setOpen(false); }}
              className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}



