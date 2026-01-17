import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  const userId = localStorage.getItem('userId'); 
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId && token) fetchBookings();
  }, [userId, token]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>

        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2">Hotel</th>
                  <th className="border px-4 py-2">Room</th>
                  <th className="border px-4 py-2">Check-in</th>
                  <th className="border px-4 py-2">Check-out</th>
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{b.hotel_name || b.hotel}</td>
                    <td className="border px-4 py-2">{b.room_name || b.room}</td>
                    <td className="border px-4 py-2">{b.check_in}</td>
                    <td className="border px-4 py-2">{b.check_out}</td>
                    <td className={`border px-4 py-2 ${b.status === 'confirmed' ? 'text-green-600' : b.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {b.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

