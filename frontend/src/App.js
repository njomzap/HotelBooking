import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import UserNavbar from "./components/UserNavbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Catalogue from "./pages/Catalogue";
import HotelDetails from "./pages/HotelDetails";
import RoomDetail from "./pages/RoomDetails";

import SimpleUserDashboard from "./pages/SimpleUserDashboard/Indexx";
import Profile from "./pages/SimpleUserDashboard/profilee";
import UserBookings from "./pages/SimpleUserDashboard/UserBookings";

import AdminDashboard from "./pages/AdminDashboard/Index";
import Users from "./pages/AdminDashboard/Users";
import Employees from "./pages/AdminDashboard/Employees";
import Rooms from "./pages/AdminDashboard/Rooms";
import Bookings from "./pages/AdminDashboard/Bookings";
import HotelsAdmin from "./pages/AdminDashboard/Hotels";
import PromoCodes from "./pages/AdminDashboard/PromoCodes";
import ProfileAdmin from "./pages/AdminDashboard/Profile";

import EmployeeLayout from "./components/EmployeeLayout";
import LostFound from "./pages/LostFound";
import EmployeeBookings from "./pages/EmployeeDashboard/bookings";
import EmployeeRooms from "./pages/EmployeeDashboard/rooms";
import EmployeeProfile from "./pages/EmployeeDashboard/profile";
import EmployeeLostFound from "./pages/EmployeeDashboard/LostFound";
import EmployeeDashboard from "./pages/EmployeeDashboard/index";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) setRole(savedRole);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {(!role || role === "user") && <Navbar setRole={setRole} />}
        {role === "user" && <UserNavbar setRole={setRole} />}

        <main className="flex-grow">
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/hotels" element={<Catalogue user={role ? { role } : null} />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />

            {/* ADMIN */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/promo-codes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PromoCodes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotels"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <HotelsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProfileAdmin />
                </ProtectedRoute>
              }
            />

            {/* EMPLOYEE (Single Layout Wrapper) */}
            <Route
              path="/employee/dashboard/*"
              element={<Navigate to="/employee-dashboard" replace />}
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeeDashboard />} />  {/* default dashboard */}
              <Route path="rooms" element={<EmployeeRooms />} />
              <Route path="bookings" element={<EmployeeBookings />} />
              <Route path="lostfound" element={<EmployeeLostFound />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>


            {/* SIMPLE USER */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <SimpleUserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/bookings"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
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
