import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HotelsUser() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hotels'); 
        setHotels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading hotels...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Browse Hotels</h1>
      {hotels.length === 0 ? (
        <p>No hotels available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map(hotel => (
            <div key={hotel.id} className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold">{hotel.name}</h2>
              <p className="text-gray-600">{hotel.location}</p>
              <Link
                to={`/hotels/${hotel.id}`}
                className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

