import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search, ArrowRight } from "lucide-react";

export default function HeroSearchBanner({ userName }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const title = userName ? `Welcome back, ${userName}!` : "Find Your Perfect Stay";
  const description = userName
    ? "Pick up where you left off, manage your bookings, and uncover new places to make memories."
    : "Discover amazing hotels and resorts worldwide. Book with confidence and enjoy unforgettable experiences.";

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = search.trim();
    if (trimmed) params.append("search", trimmed);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80"
          alt="Hotel"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="bg-black/50 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </form>

        <Link to="/hotels">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2 mx-auto">
            Browse Hotels
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
