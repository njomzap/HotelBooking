import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/tokenService";

import SummaryCard from "../../components/SummaryCard";

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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <header
          className="relative w-full min-h-[60vh] rounded-3xl overflow-hidden shadow-lg"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.05) 100%), url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            marginTop: "80px",
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white space-y-4">
            <p className="uppercase tracking-[0.4em] text-xs text-white/70">Welcome back</p>
            <h1 className="text-3xl md:text-5xl font-semibold max-w-3xl">
              {user?.name ? `${user.name.split(" ")[0]}, your next stay awaits` : "Your next stay awaits"}
            </h1>
            <p className="max-w-2xl text-white/80">
              Keep an eye on upcoming trips, grab exclusive promo codes, and pick up where you left off.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/user/bookings")}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium"
              >
                View my bookings
              </button>
            </div>
          </div>
        </header>

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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=80"
              alt="Calendar reminder"
              className="w-full h-32 object-cover"
            />
            <div className="p-6 space-y-2">
              <p className="text-sm uppercase tracking-wide text-gray-400">Travel tip</p>
              <h4 className="text-2xl font-semibold text-gray-900">Check-in reminders</h4>
              <p className="text-gray-600 text-sm">
                We’ll email you 48 hours before each stay with check-in instructions and directions.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80"
              alt="Promo savings"
              className="w-full h-32 object-cover"
            />
            <div className="p-6 space-y-2">
              <p className="text-sm uppercase tracking-wide text-gray-400">Members perk</p>
              <h4 className="text-2xl font-semibold text-gray-900">Save promo codes</h4>
              <p className="text-gray-600 text-sm">
                Copy a promo to your clipboard and apply it during booking to lock in the discount.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=900&q=80"
              alt="Support"
              className="w-full h-32 object-cover"
            />
            <div className="p-6 space-y-2">
              <p className="text-sm uppercase tracking-wide text-gray-400">Support</p>
              <h4 className="text-2xl font-semibold text-gray-900">24/7 assistance</h4>
              <p className="text-gray-600 text-sm">
                Need itinerary changes or special arrangements? Reach out anytime—we’re here for you.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="border rounded-xl p-4 text-left hover:border-orange-500"
                onClick={() => navigate("/user/bookings")}
              >
                <p className="font-semibold text-gray-800">Bookings</p>
                <p className="text-sm text-gray-500">Review or update</p>
              </button>
              <button
                className="border rounded-xl p-4 text-left hover:border-orange-500"
                onClick={() => navigate("/user/profile")}
              >
                <p className="font-semibold text-gray-800">Profile & Payments</p>
                <p className="text-sm text-gray-500">Manage details</p>
              </button>
              <button
                className="border rounded-xl p-4 text-left hover:border-orange-500"
                onClick={() => navigate("/lost-found")}
              >
                <p className="font-semibold text-gray-800">Lost & Found</p>
                <p className="text-sm text-gray-500">Submit request</p>
              </button>
              <div className="border rounded-xl p-4 text-left text-gray-400">
                <p className="font-semibold">More coming soon</p>
                <p className="text-sm">Personalized tips on the way</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow p-6 text-white space-y-3">
            <h3 className="text-2xl font-semibold">Need help?</h3>
            <p className="text-orange-100">
              Our support team is available 24/7 for booking questions, changes, or special requests.
            </p>
            <div className="flex gap-3">
              <button
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                onClick={() => (window.location.href = "mailto:support@bookyourstay.com")}
              >
                Email Support
              </button>
              <button
                className="bg-white text-orange-600 rounded-lg px-4 py-2 font-semibold"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
