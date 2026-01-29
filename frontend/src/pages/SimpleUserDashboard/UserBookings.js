import React, { useEffect, useState } from "react";
import axios from "axios";

const BOOKINGS_API = "http://localhost:5000/api/bookings";
const PAYMENTS_API = "http://localhost:5000/api/payments";

const statusColors = {
  pending: "#FFA500",
  pending_payment: "#FF8C00",
  confirmed: "#FF7A33",
  cancelled: "#FF6347",
  completed: "#FF4500",
  paid: "#FF7A33",
};

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
    fetchBookings();
    // eslint-disable-next-line
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

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "5rem auto 3rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
          fontSize: "2.2rem",
          color: "#FF7A33",
          fontWeight: "700",
        }}
      >
        My Bookings
      </h2>

      {bookings.length === 0 && (
        <p style={{ textAlign: "center", color: "#777" }}>No bookings found.</p>
      )}

      {bookings.map((booking) => {
        // Fallbacks for missing fields
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
            style={{
              borderRadius: "16px",
              padding: "1.8rem",
              marginBottom: "1.8rem",
              boxShadow: "0 6px 20px rgba(255,165,0,0.1)",
              transition: "transform 0.3s, box-shadow 0.3s",
              backgroundColor: "#fff",
              borderLeft: `5px solid ${statusColors[status] || "#FFA500"}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,165,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,165,0,0.1)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.8rem",
              }}
            >
              <h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#FF7A33" }}>
                {hotelName} — {roomName}
              </h3>

              <span
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  color: "#fff",
                  backgroundColor: statusColors[status] || "#FFA500",
                }}
              >
                {status}
              </span>
            </div>

            {editingId === booking.id ? (
              <div style={{ marginTop: "1rem" }}>
                <label>
                  Check-in:
                  <input
                    type="date"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.4rem",
                      borderRadius: "8px",
                      border: "1px solid #FFB366",
                    }}
                  />
                </label>
                <label style={{ marginLeft: "1rem" }}>
                  Check-out:
                  <input
                    type="date"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.4rem",
                      borderRadius: "8px",
                      border: "1px solid #FFB366",
                    }}
                  />
                </label>

                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={() => saveEdit(booking.id)}
                    disabled={saving}
                    style={{
                      padding: "0.5rem 1rem",
                      marginRight: "0.6rem",
                      backgroundColor: "#FF7A33",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#FF4500",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "1rem", color: "#555" }}>
                <p>
                  <strong>Dates:</strong> {checkIn} → {checkOut}
                </p>
                <p>
                  <strong>Total:</strong> €{totalPrice}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "20px",
                      color: "#fff",
                      backgroundColor: statusColors[paymentStatus] || "#FFA500",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    {paymentStatus}
                  </span>
                </p>

                <div style={{ marginTop: "1rem" }}>
                  {status !== "cancelled" && (
                    <>
                      <button
                        onClick={() => startEdit(booking)}
                        disabled={status !== "pending_payment"}
                        style={{
                          padding: "0.45rem 1rem",
                          marginRight: "0.5rem",
                          backgroundColor: "#FFB366",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          cursor: status !== "pending_payment" ? "not-allowed" : "pointer",
                          opacity: status !== "pending_payment" ? 0.6 : 1,
                          fontWeight: "600",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => cancelBooking(booking.id)}
                        style={{
                          padding: "0.45rem 1rem",
                          marginRight: "0.5rem",
                          backgroundColor: "#FF7A33",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Cancel
                      </button>

                      {status === "pending_payment" && (
                        <button
                          onClick={() => handlePayment(booking.id)}
                          style={{
                            padding: "0.5rem 1.2rem",
                            backgroundColor: "#FF4500",
                            color: "#fff",
                            border: "none",
                            borderRadius: "14px",
                            cursor: "pointer",
                            fontWeight: "700",
                            boxShadow: "0 4px 15px rgba(255,69,0,0.3)",
                          }}
                        >
                          Pay Now
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserBookings;
