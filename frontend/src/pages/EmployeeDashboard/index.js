import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DoorClosed, ClipboardList, LifeBuoy, UserCog } from "lucide-react";

import SummaryCard from "../../components/SummaryCard";
import DashboardHeroCard from "../../components/DashboardHeroCard";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const assignedHotelId = localStorage.getItem("hotelId");
  const employeeName =
    localStorage.getItem("userName") || localStorage.getItem("name") || localStorage.getItem("employeeName") || "";

  const [summaryData, setSummaryData] = useState({
    rooms: 0,
    bookings: 0,
    lostfound: 0,
  });
  const [assignmentError, setAssignmentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    if (role === "employee" && !assignedHotelId) {
      setAssignmentError(
        "You are not assigned to a hotel yet. Please contact an administrator to link your account before managing dashboard data."
      );
      setLoading(false);
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
        setError(null);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token, role, assignedHotelId]);

  const goToRooms = () => navigate("/employee-dashboard/rooms");
  const goToBookings = () => navigate("/employee-dashboard/bookings");
  const goToLostFound = () => navigate("/employee-dashboard/lostfound");
  const goToProfile = () => navigate("/employee-dashboard/profile");

  const quickActions = [
    {
      title: "Manage rooms",
      description: "Open, close, or update room inventory.",
      icon: DoorClosed,
      onClick: goToRooms,
    },
    {
      title: "Monitor bookings",
      description: "Confirm arrivals and handle requests.",
      icon: ClipboardList,
      onClick: goToBookings,
    },
    {
      title: "Lost & found",
      description: "Track guest submissions and resolutions.",
      icon: LifeBuoy,
      onClick: goToLostFound,
    },
    {
      title: "Profile",
      description: "Update contact info or shift details.",
      icon: UserCog,
      onClick: goToProfile,
    },
  ];

  const opsChecklist = [
    "Confirm tomorrow's arrivals",
    "Update rooms currently under maintenance",
    "Respond to pending lost & found cases",
    "Sync with housekeeping on priority turnovers",
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading dashboard…</div>;
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button className="px-4 py-2 bg-orange-500 text-white rounded" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <DashboardHeroCard
          eyebrow="Operations overview"
          title={
            employeeName
              ? `${employeeName.split(" ")[0]}, keep your property running smoothly`
              : "Keep your property running smoothly"
          }
          description="Monitor room readiness, booking status, and guest support updates from one place."
          actions={[
            { label: "Manage rooms", onClick: goToRooms },
            { label: "Review bookings", onClick: goToBookings, variant: "secondary" },
          ]}
        />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Rooms" value={summaryData.rooms} />
          <SummaryCard title="Bookings" value={summaryData.bookings} />
          <SummaryCard title="Lost & Found" value={summaryData.lostfound} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">Shift focus</p>
              <h2 className="text-2xl font-semibold text-gray-900">Today's priorities</h2>
              <p className="text-gray-600 mt-2">
                Keep guests informed, coordinate with housekeeping, and clear any outstanding tickets before check-in.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600" onClick={goToBookings}>
                View arrivals
              </button>
              <button
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-orange-400"
                onClick={goToRooms}
              >
                Update rooms
              </button>
            </div>
            <ul className="space-y-3">
              {opsChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow p-6">
            <p className="text-sm uppercase tracking-wide text-white/60">Snapshot</p>
            <h3 className="text-2xl font-semibold mt-1">Live property pulse</h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70">Rooms in inventory</p>
                <p className="text-3xl font-bold">{summaryData.rooms}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Open lost & found</p>
                <p className="text-3xl font-bold">{summaryData.lostfound}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Bookings this week</p>
                <p className="text-3xl font-bold">{summaryData.bookings}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Assigned hotel</p>
                <p className="text-lg font-semibold">{assignedHotelId || "—"}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Double-check inventory before peak check-in windows to avoid room-switch surprises.
            </p>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map(({ title, description, icon: Icon, onClick }) => (
                <button
                  key={title}
                  className="border rounded-2xl p-4 text-left hover:border-orange-500 transition"
                  onClick={onClick}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Icon className="w-5 h-5" />
                    </span>
                    <p className="font-semibold text-gray-900">{title}</p>
                  </div>
                  <p className="text-sm text-gray-500">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


