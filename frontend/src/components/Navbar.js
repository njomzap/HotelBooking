import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/tokenService';

export default function Navbar({ setRole }) {
  const navigate = useNavigate();
  const [role, setLocalRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    setLocalRole(savedRole);
  }, []);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    // Log logout attempt with detailed token info
    console.log('🗑️ TOKEN DESTRUCTION INITIATED:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 ACCESS TOKEN (TO BE DESTROYED):');
    console.log('   Token:', accessToken || 'null');
    console.log('   Storage: localStorage');
    console.log('   Status: Will be cleared from localStorage');
    console.log('');
    console.log('🔄 REFRESH TOKEN (TO BE DESTROYED):');
    console.log('   Token: [HttpOnly cookie - not accessible via JS]');
    console.log('   Storage: Browser Cookie (httpOnly)');
    console.log('   Status: Will be revoked on server');
    console.log('');
    console.log('👤 USER INFO:');
    console.log('   Role:', role || 'null');
    console.log('   User ID:', userId || 'null');
    console.log('   Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    try {
      await logout();
      
      // Log successful destruction
      console.log('✅ TOKENS SUCCESSFULLY DESTROYED:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 ACCESS TOKEN:');
      console.log('   Status: ✅ Cleared from localStorage');
      console.log('🔄 REFRESH TOKEN:');
      console.log('   Status: ✅ Revoked on server');
      console.log('👤 USER SESSION:');
      console.log('   Status: ✅ Terminated');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      
      setLocalRole(null);
      if (setRole) setRole(null);
      navigate("/login");
    } catch (error) {
      console.error('❌ LOGOUT ERROR:');
      console.error('Error details:', error);
      console.log('⚠️ FALLBACK: Clearing local storage anyway...');
      
      // Still clear local data even if server call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      
      console.log('📱 ACCESS TOKEN:');
      console.log('   Status: ⚠️ Cleared locally (server error)');
      console.log('🔄 REFRESH TOKEN:');
      console.log('   Status: ⚠️ May still be active on server');
      
      setLocalRole(null);
      if (setRole) setRole(null);
      navigate("/login");
    }
  };

  const showLogout = role === "admin" || role === "employee";

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>

        <ul className="flex items-center gap-10 text-gray-700 text-md">
          {!showLogout && (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalogue">Hotels</Link></li>
              <li><Link to="/about">About</Link></li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-4">
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
