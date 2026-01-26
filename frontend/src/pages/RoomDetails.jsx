import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/rooms";
const BOOKINGS_API = "http://localhost:5000/api/bookings";
const EXTRA_REQUESTS_API = "http://localhost:5000/api/extra-requests";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [extraRequest, setExtraRequest] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setRoom(res.data);
        setCurrentImage(0);
      } catch (err) {
        console.error(err);
        alert("Room not found");
      }
    };
    fetchRoom();
  }, [id]);

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const handleBooking = async () => {
    if (!room || !room.id) {
      setMessage("Room information is still loading. Please wait.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to book a room");
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage("Please select check-in and check-out dates");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const bookingRes = await axios.post(
        BOOKINGS_API,
        {
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const bookingId = bookingRes.data.id;
      setCreatedBookingId(bookingId);

      if (extraRequest.trim()) {
        await axios.post(EXTRA_REQUESTS_API, {
          booking_id: bookingId,
          request_text: extraRequest,
        });
      }

      setMessage("Booking successful! Extra request saved.");
      setExtraRequest("");
    } catch (err) {
      console.error("AXIOS ERROR:", err);
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        ← Back to Hotel
      </button>

      <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-md">
        {room.images && room.images.length > 0 ? (
          <>
            <img
              src={`http://localhost:5000${room.images[currentImage]}`}
              alt={room.room_name}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {room.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-3 shadow"
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-3 shadow"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-orange-500 text-lg font-semibold">
              {room.hotel_name || "Hotel"}
            </h2>
            <h1 className="text-4xl font-bold mt-1">{room.room_name}</h1>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-700 mt-4">
            <div className="bg-gray-100 px-3 py-1 rounded">
              🛏 {room.capacity} Guests
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded">
              #️⃣ Room {room.room_number}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded">
              💵 ${room.price} / night
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{room.description}</p>
          </div>
        </div>

        <div className="space-y-4 border rounded p-4 shadow">
          <div>
            <label className="block text-gray-600 mb-1">Check-in</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Check-out</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              Extra Requests (optional)
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows="3"
              placeholder="e.g. Late checkout, extra pillows"
              value={extraRequest}
              onChange={(e) => setExtraRequest(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={loading || !room}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Now"}
          </button>

          {message && <p className="mt-2 text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
