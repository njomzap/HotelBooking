import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../../components/SummaryCardE";
import QuickActionButton from "../../components/QuickActionButtonE";
import axios from "axios";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [summaryData, setSummaryData] = useState({
    rooms: 0,
    bookings: 0,
    lostfound: 0,
  });

  // Fetch summary data
  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        const [roomsRes, bookingsRes, lostRes] = await Promise.all([
          axios.get("http://localhost:5000/api/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/lostfound", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSummaryData({
          rooms: roomsRes.data.length,
          bookings: bookingsRes.data.length,
          lostfound: lostRes.data.length,
        });
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchSummary();
  }, [token]);

 

const goToRooms = () => navigate("/employee-dashboard/rooms");
const goToBookings = () => navigate("/employee-dashboard/bookings");
const goToLostFound = () => navigate("/employee-dashboard/lostfound");
const goToProfile = () => navigate("/employee-dashboard/profile");

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard title="Rooms" value={summaryData.rooms} />
        <SummaryCard title="Bookings" value={summaryData.bookings} />
        <SummaryCard title="Lost & Found" value={summaryData.lostfound} />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-4">
        <QuickActionButton title="Rooms" onClick={goToRooms} />
        <QuickActionButton title="Bookings" onClick={goToBookings} />
        <QuickActionButton title="Lost & Found" onClick={goToLostFound} />
        <QuickActionButton title="Profile" onClick={goToProfile} />
      </div>
    </div>
  );
};

export default EmployeeDashboard;


