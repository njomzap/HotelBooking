import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, DollarSign, Edit, X, CreditCard, Clock, User, Home } from "lucide-react";

const BOOKINGS_API = "http://localhost:5000/api/bookings";
const PAYMENTS_API = "http://localhost:5000/api/payments";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("=== USERBOOKINGS COMPONENT MOUNTED ===");
    console.log("Token available:", !!token);
    console.log("Token type:", typeof token);
    console.log("Token length:", token?.length);
    
    if (token && token.trim() !== "") {
      fetchBookings();
    } else {
      console.log("No valid token found, skipping booking fetch");
      setError("Please login to view your bookings");
      setLoading(false);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${BOOKINGS_API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data || []);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditCheckIn(booking.check_in?.split("T")[0] || "");
    setEditCheckOut(booking.check_out?.split("T")[0] || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCheckIn("");
    setEditCheckOut("");
  };

  const saveEdit = async (bookingId) => {
    try {
      setSaving(true);
      await axios.put(
        `${BOOKINGS_API}/user/${bookingId}`,
        { check_in: editCheckIn, check_out: editCheckOut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBookings();
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.delete(`${BOOKINGS_API}/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const res = await axios.post(
        `${PAYMENTS_API}/create-checkout-session`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("Payment failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "pending_payment": return "bg-orange-100 text-orange-700 border-orange-200";
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 font-medium">Loading your bookings...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">HotelBooking</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="/catalogue" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">
                  Hotels
                </a>
                <a href="/user-dashboard" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">
                  Dashboard
                </a>
                <a href="/user-bookings" className="text-orange-600 font-medium border-b-2 border-orange-600 pb-4">
                  My Bookings
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">User</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-orange-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">My Bookings</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-lg text-gray-600">Manage your hotel reservations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-16 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No bookings found</h3>
            <p className="text-lg text-gray-600 mb-6">You haven't made any reservations yet</p>
            <a
              href="/catalogue"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium"
            >
              <Home className="w-5 h-5" />
              Browse Hotels
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const status = booking.status || "pending";
              const paymentStatus = booking.payment_status || "pending";
              const hotelName = booking.hotel_name || "Hotel";
              const roomName = booking.room_name || "Room";
              const totalPrice = booking.total_price ?? 0;
              const checkIn = booking.check_in?.slice(0, 10) || "N/A";
              const checkOut = booking.check_out?.slice(0, 10) || "N/A";

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {hotelName}
                        </h3>
                        <p className="text-lg text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {roomName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                          Booking Status: {status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(paymentStatus)}`}>
                          Payment Status: {paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {editingId === booking.id ? (
                      <div className="space-y-6">
                        <div className="bg-amber-50 rounded-xl p-4 border border-orange-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Booking Dates</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                              <input
                                type="date"
                                value={editCheckIn}
                                onChange={(e) => setEditCheckIn(e.target.value)}
                                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                              <input
                                type="date"
                                value={editCheckOut}
                                onChange={(e) => setEditCheckOut(e.target.value)}
                                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => saveEdit(booking.id)}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 font-medium"
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-gray-900">Check-in</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{checkIn}</p>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-gray-900">Check-out</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{checkOut}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-gray-900">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">${totalPrice}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          {status !== "cancelled" && (
                            <>
                              <button
                                onClick={() => startEdit(booking)}
                                disabled={status !== "pending_payment"}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>

                              <button
                                onClick={() => cancelBooking(booking.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                              >
                                Cancel
                              </button>

                              {status === "pending_payment" && (
                                <button
                                  onClick={() => handlePayment(booking.id)}
                                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center gap-2"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Pay Now
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
