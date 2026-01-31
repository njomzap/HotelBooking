import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ClipboardList, Users2, BadgeDollarSign } from "lucide-react";

import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import SummaryCard from "../../components/SummaryCard";
import DashboardHeroCard from "../../components/DashboardHeroCard";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const adminName =
    localStorage.getItem("userName") || localStorage.getItem("name") || localStorage.getItem("adminName") || "";

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
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const totalBookingsToday = bookings.filter((b) => b.date?.startsWith(today)).length;
  const totalRevenueToday = bookings
    .filter((b) => b.date?.startsWith(today) && b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.price || 0), 0)
    .toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
  const registeredUsers = users.filter((u) => u.role === "user").length;
  const totalEmployees = users.filter((u) => u.role === "employee").length;
  const availableRooms = rooms.length;
  const pendingApprovals = bookings.filter((b) => b.status === "pending").length;

  const quickActions = [
    {
      title: "Manage hotels",
      description: "Oversee inventory and property status.",
      icon: Building2,
      onClick: () => navigate("/admin/hotels"),
    },
    {
      title: "Bookings & approvals",
      description: "Confirm, cancel, or review pending requests.",
      icon: ClipboardList,
      onClick: () => navigate("/admin/bookings"),
    },
    {
      title: "Team & staffing",
      description: "Add employees or update roles.",
      icon: Users2,
      onClick: () => navigate("/admin/employees"),
    },
    {
      title: "Promo & revenue",
      description: "Adjust rates or launch promo codes.",
      icon: BadgeDollarSign,
      onClick: () => navigate("/admin/promo-codes"),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading dashboard…</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button className="px-4 py-2 bg-orange-500 text-white rounded" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50 -m-6 p-6 min-h-screen space-y-10">
        <DashboardHeroCard
          eyebrow="Admin control center"
          title={
            adminName ? `${adminName.split(" ")[0]}, keep the platform running smoothly` : "Keep the platform running smoothly"
          }
          description="Track revenue, team capacity, and guest activity in one place."
          actions={[
            { label: "Review bookings", onClick: () => navigate("/admin/bookings") },
            { label: "Manage hotels", onClick: () => navigate("/admin/hotels"), variant: "secondary" },
          ]}
        />

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SummaryCard title="Bookings today" value={totalBookingsToday} />
          <SummaryCard title="Revenue today" value={totalRevenueToday} />
          <SummaryCard title="Registered users" value={registeredUsers} />
          <SummaryCard title="Employees" value={totalEmployees} />
          <SummaryCard title="Available rooms" value={availableRooms} />
          <SummaryCard title="Pending approvals" value={pendingApprovals} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">Approvals & alerts</p>
              <h2 className="text-2xl font-semibold text-gray-900">Today's admin focus</h2>
              <p className="text-gray-600 mt-2">
                Clear pending approvals, unblock revenue-impacting requests, and stay ahead of guest escalations.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                `${pendingApprovals} bookings awaiting admin action`,
                `${totalEmployees} employees active across properties`,
                `${availableRooms} rooms currently available for assignment`,
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600" onClick={() => navigate("/admin/bookings")}>
                Review queue
              </button>
              <button
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-orange-400"
                onClick={() => navigate("/admin/employees")}
              >
                Manage team
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow p-6">
            <p className="text-sm uppercase tracking-wide text-white/60">Revenue snapshot</p>
            <h3 className="text-2xl font-semibold mt-1">Platform health</h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70">Bookings today</p>
                <p className="text-3xl font-bold">{totalBookingsToday}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Revenue today</p>
                <p className="text-3xl font-bold">{totalRevenueToday}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Active users</p>
                <p className="text-3xl font-bold">{registeredUsers}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Pending tasks</p>
                <p className="text-3xl font-bold">{pendingApprovals}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Export detailed ledgers or schedule payout reviews directly from the bookings panel.
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
    </AdminLayout>
  );
}

