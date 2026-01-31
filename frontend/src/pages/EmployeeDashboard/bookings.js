import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Users, MapPin, DollarSign, Edit, Trash2, Clock, CheckCircle, XCircle, Mail, MessageSquare, CreditCard } from "lucide-react";

const API_URL = "http://localhost:5000/api/bookings";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const assignedHotelId = localStorage.getItem("hotelId");

  const axiosInstance = axios.create({
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });

  const fetchBookings = async () => {
    if (!token) return;

    if (role === "employee" && !assignedHotelId) {
      setAssignmentError("You are not assigned to a hotel. Please contact an administrator to link your account before managing bookings.");
      setBookings([]);
      return;
    } else {
      setAssignmentError("");
    }

    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to fetch bookings. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleStatusEdit = (booking) => {
    setEditingId(booking.id);
    setEditStatus(booking.status || "pending");
  };

  const handleStatusSave = async (bookingId) => {
    try {
      await axiosInstance.put(`${API_URL}/${bookingId}`, {
        status: editStatus
      });
      setEditingId(null);
      setEditStatus("");
      fetchBookings();
      alert("Booking status updated successfully!");
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update booking status");
    }
  };

  const handleStatusCancel = () => {
    setEditingId(null);
    setEditStatus("");
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this booking? This action cannot be undone.")) return;
    
    try {
      await axiosInstance.delete(`${API_URL}/${bookingId}/hard`);
      fetchBookings();
      alert("Booking deleted permanently!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'pending_payment':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!token) return <p className="text-center text-red-500 mt-4">You are not logged in.</p>;

  if (assignmentError) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">
            !
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hotel assignment required</h2>
          <p className="text-gray-600">{assignmentError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            </div>
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
            </div>
          </div>
          <p className="text-gray-600 mt-2">Manage and monitor all hotel bookings</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">There are no bookings in the system yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Booking #{booking.id}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{booking.user_name || `User ${booking.user_id}`}</span>
                        </div>
                        {booking.user_email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{booking.user_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status || 'pending'}
                      </div>
                      {booking.payment_status && (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPaymentStatusColor(booking.payment_status)}`}>
                          {getPaymentStatusIcon(booking.payment_status)}
                          {booking.payment_status}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">
                        {booking.hotel_name || `Hotel ${booking.hotel_id}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700">
                        {booking.room_name || `Room ${booking.room_id}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700">
                        Check-in: {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700">
                        Check-out: {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    {booking.total_price && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">
                          ${Number(booking.total_price).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {booking.payment_amount && booking.payment_amount !== booking.total_price && (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">
                          Paid: ${Number(booking.payment_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extra Requests Section */}
                {booking.extra_requests && booking.extra_requests.length > 0 && (
                  <div className="px-6 pb-4 border-t border-gray-200">
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Special Requests ({booking.extra_requests.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {booking.extra_requests.map((request, index) => (
                          <div key={request.id} className="bg-orange-50 rounded-md p-3 border border-orange-200">
                            <p className="text-sm text-gray-700">{request.request_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  {editingId === booking.id ? (
                    <div className="space-y-3">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="paid">Paid</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusSave(booking.id)}
                          className="flex-1 bg-green-500 text-white py-2 px-3 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleStatusCancel}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusEdit(booking)}
                        className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Status
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;

