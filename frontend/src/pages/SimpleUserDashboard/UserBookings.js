import React, { useEffect, useState } from "react";
import axios from "axios";

const BOOKINGS_API = "http://localhost:5000/api/bookings";
const PAYMENTS_API = "http://localhost:5000/api/payments";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BOOKINGS_API}/user/${userId}`, headers);
      setBookings(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Handle Stripe payment
  const handlePayment = async (bookingId) => {
    setPayingId(bookingId);
    try {
      const res = await axios.post(
        `${PAYMENTS_API}/create-checkout-session`,
        { bookingId },
        headers
      );

      // Open Stripe checkout in new tab
      window.open(res.data.url, "_blank");

      // Poll backend after a few seconds to update booking status
      setTimeout(fetchBookings, 5000);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [userId]);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading your bookings...
      </div>
    );
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto mt-24 px-4">
      <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">
        Your Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-400 italic">
          You have no bookings yet.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => {
            const checkIn = new Date(b.check_in).toLocaleDateString();
            const checkOut = new Date(b.check_out).toLocaleDateString();
            const nights = Math.ceil(
              (new Date(b.check_out) - new Date(b.check_in)) / (1000 * 60 * 60 * 24)
            );
            const total = Number(b.total_price);

            // Show Stripe button if booking is unpaid
            const isPendingPayment =
              b.status === "pending" || b.status === "pending_payment";

            // Status color mapping
            let statusColor = "bg-gray-100 text-gray-700";
            if (b.status === "pending" || b.status === "pending_payment")
              statusColor = "bg-yellow-100 text-yellow-800";
            else if (b.status === "confirmed")
              statusColor = "bg-green-100 text-green-800";
            else if (b.status === "cancelled")
              statusColor = "bg-red-100 text-red-800";
            else if (b.status === "completed")
              statusColor = "bg-blue-100 text-blue-800";

            // Debugging: optional
            // console.log("Booking:", b.id, "status:", b.status, "isPendingPayment:", isPendingPayment);

            return (
              <div
                key={b.id}
                className="bg-white border rounded-3xl shadow-md p-6 flex flex-col justify-between hover:shadow-2xl transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                    {b.room_name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Hotel:</span> {b.hotel_name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Check-in:</span> {checkIn}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Check-out:</span> {checkOut}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Nights:</span> {nights}
                  </p>

                  <p className="font-bold text-orange-500 mb-2 text-lg">
                    Total: ${total.toFixed(2)}
                  </p>

                  <p className="text-gray-700 font-semibold mb-1">
                    Payment Status:
                  </p>
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColor}`}
                  >
                    {b.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {isPendingPayment && (
                  <button
                    onClick={() => handlePayment(b.id)}
                    disabled={payingId === b.id}
                    className="mt-4 w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold py-2 rounded-full hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 transition-all"
                  >
                    {payingId === b.id ? "Processing..." : "Pay with Stripe Sandbox"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
