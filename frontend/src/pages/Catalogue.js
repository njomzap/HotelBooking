import React, { useEffect, useState } from "react";
import HotelCard from "../components/HotelCard";
import axios from "axios";

const Catalogue = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hotels");
      const hotelsData = Array.isArray(res.data) ? res.data : res.data.hotels;
      setHotels(hotelsData || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-20 max-w-7xl mx-auto">

      {}
      <div className="relative w-full h-[30vh] mb-12 rounded-2xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500/70"></div>
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
          Hotels Catalogue
        </h1>
      </div>

      {}
      {loading ? (
        <p className="text-center text-gray-500 font-medium">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-center text-gray-500 font-medium">No hotels found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <HotelCard
                hotel={{
                  id: hotel.id,
                  hotel_name: hotel.hotel_name || hotel.name || "No name",
                  city: hotel.city || "Unknown",
                  address: hotel.address || "-",
                  price_per_night: hotel.price_per_night || hotel.price || 100,
                  images:
                    hotel.images && hotel.images.length > 0
                      ? hotel.images
                      : ["/default-hotel.jpg"],
                  description: hotel.description || "",
                }}
                isAdmin={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogue;
