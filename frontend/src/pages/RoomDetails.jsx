import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/rooms";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error(err);
        alert("Room not found");
      }
    };
    fetchRoom();
  }, [id]);

  if (!room) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        &larr; Back to Hotel
      </button>

      <div className="w-full h-96 overflow-hidden rounded-lg">
        {room.images && room.images.length > 0 ? (
          <img
            src={`http://localhost:5000${room.images[0]}`}
            alt={room.room_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-orange-500 text-lg font-semibold">{room.hotel_name || "Hotel"}</h2>
            <h1 className="text-4xl font-bold mt-1">{room.room_name}</h1>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-700 mt-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded shadow-sm">
              🛏 <span>{room.capacity} Guests</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded shadow-sm">
              #️⃣ Room {room.room_number}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded shadow-sm">
              💵 ${room.price} / night
            </div>
          </div>

          <div className="mt-4 text-gray-700 space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{room.description}</p>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <ul className="flex flex-wrap gap-4 text-gray-600">
                {room.amenities.map((amenity, index) => (
                  <li key={index} className="bg-gray-100 px-3 py-1 rounded shadow-sm">
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4 border rounded p-4 shadow">
          <div>
            <label className="block text-gray-600 mb-1">Check-in</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Check-out</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
