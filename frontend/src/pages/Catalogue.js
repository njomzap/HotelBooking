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
      setHotels(res.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Hotels Catalogue
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 font-medium">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-center text-gray-500 font-medium">No hotels found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={{
                id: hotel.id,
                hotel_name: hotel.name,
                city: hotel.city,
                address: hotel.address,
                price_per_night: hotel.price_per_night || 100, 
                images: hotel.images && hotel.images.length > 0 ? hotel.images : ["/default-hotel.jpg"] 
              }}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogue;
