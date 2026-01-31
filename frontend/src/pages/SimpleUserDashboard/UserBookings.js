import React, { useEffect, useState } from "react";
import { Calendar, MapPin, DollarSign, Edit, X, CreditCard, Clock, User, Home, MessageSquare, Plus, Trash2 } from "lucide-react";
import api from "../../services/tokenService";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRequests, setShowRequests] = useState({});
  const [newRequest, setNewRequest] = useState("");
  const [addingRequest, setAddingRequest] = useState(null);

  const token = localStorage.getItem("accessToken");

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
      const res = await api.get("/bookings/user/me");
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
      await api.put(
        `/bookings/user/${bookingId}`,
        { check_in: editCheckIn, check_out: editCheckOut }
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
      await api.delete(`/bookings/${bookingId}`);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const res = await api.post(
        "/payments/create-checkout-session",
        { bookingId }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("Payment failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_payment": return "bg-orange-100 text-orange-800 border-orange-200";
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const addExtraRequest = async (bookingId) => {
    if (!newRequest.trim()) return;
    
    try {
      setAddingRequest(bookingId);
      await api.post("/extraRequests", {
        booking_id: bookingId,
        request_text: newRequest.trim()
      });
      setNewRequest("");
      await fetchBookings();
    } catch (err) {
      alert("Failed to add request");
    } finally {
      setAddingRequest(null);
    }
  };

  const deleteExtraRequest = async (requestId) => {
    if (!window.confirm("Delete this request?")) return;
    
    try {
      await api.delete(`/extraRequests/${requestId}`);
      await fetchBookings();
    } catch (err) {
      alert("Failed to delete request");
    }
  };

  const toggleRequests = (bookingId) => {
    setShowRequests(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  if (loading) return (
    <div className="flex flex-col min-h-full bg-orange-50">
      <header className="flex justify-between items-center bg-white border-b px-6 py-4 shadow">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="StayEase Logo"
            className="w-8 h-8 rounded-lg"
          />
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col min-h-full bg-orange-50">
      <header className="flex justify-between items-center bg-white border-b px-6 py-4 shadow">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="StayEase Logo"
            className="w-8 h-8 rounded-lg"
          />
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            </div>
            <p className="text-gray-600">Manage your hotel reservations</p>
          </div>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't made any reservations yet</p>
              <a
                href="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                <Home className="w-4 h-4" />
                Browse Hotels
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const status = booking.status || "pending";
                const paymentStatus = booking.payment_status || "pending";
                const hotelName = booking.hotel_name || "Hotel";
                const roomName = booking.room_name || "Room";
                const totalPrice = booking.total_price ?? 0;
                const checkIn = booking.check_in?.slice(0, 10) || "N/A";
                const checkOut = booking.check_out?.slice(0, 10) || "N/A";
                const extraRequests = booking.extra_requests || [];
                const hasRequests = extraRequests.length > 0;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {hotelName}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {roomName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {editingId === booking.id ? (
                        <div className="space-y-6">
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Booking Dates</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                                <input
                                  type="date"
                                  value={editCheckIn}
                                  onChange={(e) => setEditCheckIn(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                                <input
                                  type="date"
                                  value={editCheckOut}
                                  onChange={(e) => setEditCheckOut(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => saveEdit(booking.id)}
                              disabled={saving}
                              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50 font-medium"
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Booking Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-gray-900">Check-in</span>
                              </div>
                              <p className="text-lg font-semibold text-gray-900">{checkIn}</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-gray-900">Check-out</span>
                              </div>
                              <p className="text-lg font-semibold text-gray-900">{checkOut}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-gray-900">Total</span>
                              </div>
                              <p className="text-xl font-bold text-green-900">${totalPrice}</p>
                            </div>
                          </div>

                          {/* Extra Requests Section */}
                          <div className={`bg-orange-50 rounded-lg border border-orange-200 ${(status === "confirmed" || status === "completed") ? "opacity-75" : ""}`}>
                            <div 
                              className={`p-4 ${(status === "confirmed" || status === "completed") ? "" : "cursor-pointer hover:bg-orange-100"} transition-colors`}
                              onClick={() => (status !== "confirmed" && status !== "completed") && toggleRequests(booking.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <MessageSquare className={`w-4 h-4 ${(status === "confirmed" || status === "completed") ? "text-gray-400" : "text-orange-600"}`} />
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Special Requests</h4>
                                    <p className="text-sm text-gray-600">
                                      {hasRequests ? `${extraRequests.length} request${extraRequests.length > 1 ? 's' : ''}` : 'No requests added'}
                                      {(status === "confirmed" || status === "completed") && " • Requests locked"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasRequests && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                      {extraRequests.length}
                                    </span>
                                  )}
                                  {(status !== "confirmed" && status !== "completed") && (
                                    <Plus className={`w-4 h-4 text-gray-600 transition-transform ${showRequests[booking.id] ? 'rotate-45' : ''}`} />
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {showRequests[booking.id] && (status !== "confirmed" && status !== "completed") && (
                              <div className="px-4 pb-4 border-t border-orange-200">
                                {hasRequests ? (
                                  <div className="space-y-2 mt-3">
                                    {extraRequests.map((request, index) => (
                                      <div key={request.id} className="bg-white rounded-md p-3 border border-gray-200 flex items-start justify-between group hover:shadow-sm transition-all">
                                        <div className="flex-1">
                                          <p className="text-gray-800 text-sm">{request.request_text}</p>
                                        </div>
                                        <button
                                          onClick={() => deleteExtraRequest(request.id)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-sm italic mt-3">No special requests added yet.</p>
                                )}
                                
                                {/* Add Request Form */}
                                <div className="mt-3 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add a special request..."
                                    value={newRequest}
                                    onChange={(e) => setNewRequest(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addExtraRequest(booking.id)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                  />
                                  <button
                                    onClick={() => addExtraRequest(booking.id)}
                                    disabled={addingRequest === booking.id || !newRequest.trim()}
                                    className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                                  >
                                    {addingRequest === booking.id ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Plus className="w-3 h-3" />
                                    )}
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            {status !== "cancelled" && (
                              <>
                                <button
                                  onClick={() => startEdit(booking)}
                                  disabled={status !== "pending_payment"}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>

                                <button
                                  onClick={() => cancelBooking(booking.id)}
                                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition font-medium flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>

                                {status === "pending_payment" && (
                                  <button
                                    onClick={() => handlePayment(booking.id)}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-medium flex items-center gap-2"
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
    </div>
  );
};

export default UserBookings;
