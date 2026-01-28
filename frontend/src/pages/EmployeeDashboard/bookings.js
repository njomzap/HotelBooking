import React, { useEffect, useState } from "react";
import axios from "axios";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return; // no token, cannot fetch

      try {
        const res = await axios.get("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Failed to fetch bookings. Please log in again.");
      }
    };

    fetchBookings();
  }, [token]);

  if (!token) return <p className="text-center text-red-500 mt-4">You are not logged in.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3">Booking ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Room</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.id}</td>
                  <td className="p-3">{b.user}</td>
                  <td className="p-3">{b.room}</td>
                  <td className="p-3">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;

