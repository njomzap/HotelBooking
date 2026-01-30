import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../../components/SummaryCardE";
import QuickActionButton from "../../components/QuickActionButtonE";
import axios from "axios";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const assignedHotelId = localStorage.getItem("hotelId");

  const [summaryData, setSummaryData] = useState({
    rooms: 0,
    bookings: 0,
    lostfound: 0,
  });
  const [assignmentError, setAssignmentError] = useState("");

  // Fetch summary data
  useEffect(() => {
    if (!token) return;

    if (role === "employee" && !assignedHotelId) {
      setAssignmentError("You are not assigned to a hotel yet. Please contact an administrator to link your account before managing dashboard data.");
      return;
    } else {
      setAssignmentError("");
    }

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

  if (assignmentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-dashed border-orange-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">
            !
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hotel assignment required</h2>
          <p className="text-gray-600">{assignmentError}</p>
        </div>
      </div>
    );
  }

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


