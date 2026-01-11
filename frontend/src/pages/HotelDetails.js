import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
      setHotel(res.data);
    } catch (err) {
      console.error("Error fetching hotel:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 font-medium">Loading hotel details...</p>
    );
  if (!hotel)
    return (
      <p className="p-6 text-center text-red-500 font-medium">Hotel not found</p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{hotel.hotel_name}</h1>
      <p className="text-gray-500 mb-6">{hotel.city}</p>

      {}
      {hotel.images?.length ? (
        <img
          src={`http://localhost:5000${hotel.images[0]}`}
          alt={hotel.hotel_name}
          className="w-full h-96 object-cover rounded-2xl shadow-md mb-6 transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-2xl shadow-md mb-6 text-gray-400 italic">
          No image available
        </div>
      )}

      {}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <p className="text-gray-700">
          <span className="font-semibold">Address:</span> {hotel.address}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Price:</span> ${hotel.price_per_night} / night
        </p>
        {hotel.description && (
          <p className="text-gray-700">
            <span className="font-semibold">Description:</span> {hotel.description}
          </p>
        )}

        {}
        <div className="flex gap-4 mt-4 text-gray-600 text-sm">
          {hotel.has_pool && <span>🏊 Pool</span>}
          {hotel.has_gym && <span>🏋️ Gym</span>}
          {hotel.parking && <span>🅿️ Parking</span>}
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
