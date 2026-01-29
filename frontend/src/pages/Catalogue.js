import React, { useState, useEffect } from "react";
import axios from "axios";
import HotelCard from "../components/HotelCard";

const Catalogue = ({ user }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
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

    fetchHotels();
  }, []);

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || hotel.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const cities = [...new Set(hotels.map(hotel => hotel.city).filter(Boolean))];

  return (
    <div className="w-full">
      {/* Hero Section - Similar to Homepage */}
      <div className="relative w-full h-[75vh]">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1950&q=80"
          alt="Luxury Hotels"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-orange-900/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-400/30">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            Premium Hotel Collection
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
              Perfect Stay
            </span>
          </h1>
          
          <p className="max-w-3xl mb-12 text-xl text-white/90 leading-relaxed">
            Browse our curated selection of luxury hotels and premium accommodations. 
            Find the perfect place for your next unforgettable experience.
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 relative">
                    <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search hotels, destinations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-gray-800 placeholder-gray-500 bg-transparent outline-none text-lg"
                    />
                  </div>
                  
                  <div className="border-l border-gray-200">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="px-6 py-4 text-gray-700 bg-transparent border-0 outline-none cursor-pointer appearance-none bg-white"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Available Hotels</h2>
            <p className="text-gray-600 mt-2">
              {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'} matching your criteria
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent absolute top-0"></div>
              </div>
              <span className="ml-4 text-gray-600 font-medium text-lg">Discovering amazing hotels...</span>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 opacity-30">🔍</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">No Hotels Found</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                {searchTerm || selectedCity ? "Try adjusting your search criteria or explore different destinations" : "We're adding new hotels regularly. Check back soon!"}
              </p>
              {(searchTerm || selectedCity) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("");
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="transition-all duration-500 hover:-translate-y-3"
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
                      rating: hotel.rating || 4.5,
                      reviews: hotel.reviews || 0,
                      amenities: hotel.amenities || []
                    }}
                    isAdmin={user?.role === "admin"} 
                    isUser={user?.role === "user"} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
