import React, { useEffect, useState } from "react";
import axios from "axios";

const BOOKINGS_API = "http://localhost:5000/api/bookings";
const EXTRA_REQUESTS_API = "http://localhost:5000/api/extra-requests";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const getAxiosHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(BOOKINGS_API, getAxiosHeaders());
      const bookingsWithRequests = await Promise.all(
        res.data.map(async (booking) => {
          try {
            const reqRes = await axios.get(`${EXTRA_REQUESTS_API}/booking/${booking.id}`);
            return { ...booking, extraRequests: reqRes.data };
          } catch (err) {
            console.error(`Failed to fetch extra requests for booking ${booking.id}`, err);
            return { ...booking, extraRequests: [] };
          }
        })
      );
      setBookings(bookingsWithRequests);
    } catch (err) {
      console.error("FETCH BOOKINGS ERROR:", err.response?.status, err.response?.data);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await axios.put(
        `${BOOKINGS_API}/${bookingId}`,
        { status: newStatus },
        getAxiosHeaders()
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err.response?.status, err.response?.data);
      alert("Failed to update booking status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    setDeletingId(bookingId);
    try {
      await axios.delete(`${BOOKINGS_API}/${bookingId}`, getAxiosHeaders());
      fetchBookings();
    } catch (err) {
      console.error("DELETE BOOKING ERROR:", err.response?.status, err.response?.data);
      alert("Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500 italic">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Room</th>
                <th className="px-4 py-2 border">Check-in</th>
                <th className="px-4 py-2 border">Check-out</th>
                <th className="px-4 py-2 border">Booking Status</th>
                <th className="px-4 py-2 border">Payment Status</th>
                <th className="px-4 py-2 border">Total Price</th>
                <th className="px-4 py-2 border">Extra Requests</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const bookingStatusColor = {
                  pending: "text-yellow-600",
                  cancelled: "text-red-600",
                  completed: "text-green-600",
                  confirmed: "text-blue-600",
                }[booking.status] || "text-gray-700";

                const paymentStatusColor = {
                  pending: "text-yellow-600",
                  paid: "text-green-600",
                  failed: "text-red-600",
                }[booking.payment_status] || "text-gray-700";

                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{booking.id}</td>
                    <td className="px-4 py-2 border">{booking.user_name || booking.user_id}</td>
                    <td className="px-4 py-2 border">{booking.room_name || booking.room_id}</td>
                    <td className="px-4 py-2 border">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>

                    {/* Booking Status editable */}
                    <td className={`px-4 py-2 border font-semibold ${bookingStatusColor}`}>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={updatingId === booking.id}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    {/* Payment Status read-only */}
                    <td className={`px-4 py-2 border font-semibold ${paymentStatusColor}`}>
                      {booking.payment_status?.charAt(0).toUpperCase() +
                        booking.payment_status?.slice(1) || "Pending"}
                    </td>

                    <td className="px-4 py-2 border font-bold text-orange-500">
                      ${booking.total_price ? Number(booking.total_price).toFixed(2) : "0.00"}
                    </td>

                    <td className="px-4 py-2 border">
                      {booking.extraRequests?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {booking.extraRequests.map((req) => (
                            <li key={req.id}>{req.request_text}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>

                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        onClick={() => handleDelete(booking.id)}
                        disabled={deletingId === booking.id}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
