import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, CalendarCheck, UserCog } from "lucide-react";
import api from "../../services/tokenService";

import SummaryCard from "../../components/SummaryCard";
import HeroSearchBanner from "../../components/HeroSearchBanner";

export default function SimpleUserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [meRes, bookingsRes, promoRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/bookings/user/me"),
          api.get("/promo-codes/public/active?includeHotelScoped=true"),
        ]);

        setUser(meRes.data);
        setBookings(bookingsRes.data || []);
        setPromos(promoRes.data || []);
        setError(null);
      } catch (err) {
        console.error("USER DASHBOARD FETCH ERROR:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const pastBookingsCount = useMemo(() => {
    return bookings.filter((b) => new Date(b.check_out) < new Date()).length;
  }, [bookings]);

  const confirmedBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "confirmed").length;
  }, [bookings]);

  const totalNights = useMemo(() => {
    return bookings.reduce((sum, booking) => {
      if (!booking.check_in || !booking.check_out) return sum;
      const start = new Date(booking.check_in);
      const end = new Date(booking.check_out);
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      return sum + Math.max(diff, 0);
    }, 0);
  }, [bookings]);

  const quickActions = [
    {
      title: "Plan a new stay",
      description: "Browse curated hotels and flash deals.",
      icon: Compass,
      onClick: () => navigate("/catalogue"),
    },
    {
      title: "Track bookings",
      description: "Review upcoming and past trips.",
      icon: CalendarCheck,
      onClick: () => navigate("/user/bookings"),
    },
    {
      title: "Profile",
      description: "Update contact info and saved guests.",
      icon: UserCog,
      onClick: () => navigate("/user/profile"),
    },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroSearchBanner userName={user?.name ? user.name.split(" ")[0] : undefined} />

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Total Bookings" value={bookings.length} />
          <SummaryCard title="Confirmed" value={confirmedBookings} />
          <SummaryCard title="Past Trips" value={pastBookingsCount} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">Trip planner</p>
              <h2 className="text-2xl font-semibold text-gray-900">Ready for your next escape?</h2>
              <p className="text-gray-600 mt-2">
                Browse stays curated for you, save favorites, and lock in available promo codes before they expire.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => navigate("/catalogue")}
              >
                Find a room
              </button>
              <button
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-orange-400"
                onClick={() => navigate("/user/bookings")}
              >
                Manage bookings
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow p-6">
            <p className="text-sm uppercase tracking-wide text-white/60">Account snapshot</p>
            <h3 className="text-2xl font-semibold mt-1">
              {bookings.length ? `You’ve stayed ${totalNights} night${totalNights === 1 ? "" : "s"}` : "Let’s plan your first stay"}
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60">Trips completed</p>
                <p className="text-3xl font-bold">{pastBookingsCount}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Upcoming promo slots</p>
                <p className="text-3xl font-bold">{promos.length}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Keep earning perks by finishing confirmed stays. New loyalty rewards unlock after every 10 nights.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase">Stay organized</p>
              <h3 className="text-xl font-semibold text-gray-900">Travel checklist</h3>
              <p className="text-gray-500 text-sm mt-1">Quick reminders to keep every stay stress-free.</p>
            </div>
            <ul className="space-y-3">
              {[
                "Add guest details and arrival time",
                "Save promo codes to your wallet",
                "Flag any dietary or accessibility needs",
                "Download invoices after checkout",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase">Exclusive deals</p>
              <h3 className="text-xl font-semibold text-gray-900">Active Promo Codes</h3>
            </div>
            {promos.length === 0 ? (
              <p className="text-gray-500">No active promotions right now. Check back soon!</p>
            ) : (
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div key={promo.id} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{promo.code}</span>
                      <button
                        type="button"
                        className="text-xs text-orange-500"
                        onClick={() => navigator.clipboard.writeText(promo.code)}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}% off`
                        : `$${Number(promo.discount_value).toFixed(2)} off`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scope: {promo.hotel_name ? promo.hotel_name : "All hotels"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Ends on {new Date(promo.end_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
}
