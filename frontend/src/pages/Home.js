import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Shield, Headphones, Award, ArrowRight } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Navigate to hotels page with search parameter
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Discover amazing hotels and resorts worldwide. Book with confidence and enjoy unforgettable experiences.
            </p>
          </div>

         
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button type="submit" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2">
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

     
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StayEase
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make hotel booking simple, secure, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Booking</h3>
              <p className="text-gray-600">
                Your data is protected with industry-leading security standards
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Our team is always here to help you with any questions
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find the best deals and prices on thousands of properties
              </p>
            </div>
          </div>
        </div>
      </section>

     
      <section className="py-20 bg-orange-500 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Book Your Next Stay?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers and discover your perfect accommodation
          </p>
          <Link to="/hotels">
            <button className="bg-white text-orange-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto">
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
