import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout  from "../../components/AdminLayout";


const API_URL = "http://localhost:5000/api/bookings";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API_URL, authHeaders);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-4">Bookings</h1>
      {bookings.length === 0 && <p>No bookings found.</p>}

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Booking ID</th>
            <th className="p-3">User</th>
            <th className="p-3">Hotel</th>
            <th className="p-3">Room</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3">{b.id}</td>
              <td className="p-3">{b.user}</td>
              <td className="p-3">{b.hotel}</td>
              <td className="p-3">{b.room}</td>
              <td className="p-3">{new Date(b.date).toLocaleDateString()}</td>
              <td className="p-3">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
