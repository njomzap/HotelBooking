import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout } from "../services/tokenService";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    // Log logout attempt
    console.log('🗑️ ADMIN LOGOUT INITIATED:');
    console.log('Access Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    console.log('Role:', role);
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      await logout();
      console.log('✅ ADMIN LOGOUT SUCCESSFUL');
      navigate("/login");
    } catch (error) {
      console.error('❌ ADMIN LOGOUT ERROR:', error);
      // Fallback navigation
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      <header className="flex justify-between items-center bg-white border-b px-6 py-4 shadow">
     
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="StayEase Logo"
            className="w-8 h-8 rounded-lg"
          />
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
