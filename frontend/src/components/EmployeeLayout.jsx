import React from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import { logout } from "../services/tokenService";

export default function EmployeeLayout() {
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    
    // Log logout attempt
    console.log('🗑️ EMPLOYEE LOGOUT INITIATED:');
    console.log('Access Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    console.log('Role:', role);
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      await logout();
      console.log('✅ EMPLOYEE LOGOUT SUCCESSFUL');
      window.location.href = "/login";
    } catch (error) {
      console.error('❌ EMPLOYEE LOGOUT ERROR:', error);
      // Fallback navigation
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex items-center justify-between bg-white px-6 py-4 border-b shadow">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="StayEase Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <EmployeeSidebar />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
