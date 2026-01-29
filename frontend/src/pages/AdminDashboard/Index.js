import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import SummaryCard from "../../components/SummaryCard";
import QuickActionButton from "../../components/QuickActionButton";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bookingsRes, roomsRes] = await Promise.all([
          api.get("/users"),
          api.get("/bookings"),
          api.get("/rooms"),
        ]);

        setUsers(usersRes.data);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0]; 
  const totalBookingsToday = bookings.filter(b => b.date?.startsWith(today)).length;
  const totalRevenueToday = bookings
    .filter(b => b.date?.startsWith(today) && b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.price || 0), 0);
  const registeredUsers = users.filter(u => u.role === "user").length;
  const totalEmployees = users.filter(u => u.role === "employee").length;
  const availableRooms = rooms.length;
  const pendingApprovals = bookings.filter(b => b.status === "pending").length;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        <SummaryCard title="Total Bookings Today" value={totalBookingsToday} />
        <SummaryCard title="Total Revenue Today" value={`$${totalRevenueToday}`} />
        <SummaryCard title="Registered Users" value={registeredUsers} />
        <SummaryCard title="Employees" value={totalEmployees} />
        <SummaryCard title="Available Rooms" value={availableRooms} />
        <SummaryCard title="Pending Approvals" value={pendingApprovals} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton title="Add Room" onClick={() => navigate("/admin/rooms")} />
        <QuickActionButton title="Manage Bookings" onClick={() => navigate("/admin/bookings")} />
        <QuickActionButton title="See Employees" onClick={() => navigate("/admin/employees")} />
      </div>
    </AdminLayout>
  );
}

