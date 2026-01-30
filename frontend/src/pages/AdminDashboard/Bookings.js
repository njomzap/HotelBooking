import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import BookingCard from "../../components/BookingCard";

const API_URL = "/bookings";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHotels, setExpandedHotels] = useState(new Set());
  const token = localStorage.getItem("accessToken");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URL);
      const bookingsData = res.data;
      
      // Enrich bookings with actual names
      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          const enriched = { ...booking };
          
          // Get hotel name
          if (booking.hotel_id && !booking.hotel) {
            try {
              const hotelRes = await api.get(`/hotels/${booking.hotel_id}`);
              enriched.hotel = hotelRes.data.name;
            } catch (err) {
              enriched.hotel = 'Unknown Hotel';
            }
          }
          
          // Get room name
          if (booking.room_id && !booking.room) {
            try {
              const roomRes = await api.get(`/rooms/${booking.room_id}`);
              enriched.room = roomRes.data.room_name;
            } catch (err) {
              enriched.room = 'Unknown Room';
            }
          }
          
          // Get user name
          if (booking.user_id && !booking.user) {
            try {
              const userRes = await api.get(`/users/${booking.user_id}`);
              enriched.user = userRes.data.username;
            } catch (err) {
              enriched.user = 'Unknown User';
            }
          }
          
          return enriched;
        })
      );
      
      setBookings(enrichedBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchHotels();
  }, []);

  // Group bookings by hotel
  const groupBookingsByHotel = () => {
    const grouped = {};
    bookings.forEach((booking) => {
      const hotelName = booking.hotel || 'Unknown Hotel';
      if (!grouped[hotelName]) {
        grouped[hotelName] = {
          bookings: []
        };
      }
      grouped[hotelName].bookings.push(booking);
    });
    return grouped;
  };

  const groupedBookings = groupBookingsByHotel();

  const toggleHotelBookings = (hotelName) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelName)) {
      newExpanded.delete(hotelName);
    } else {
      newExpanded.add(hotelName);
    }
    setExpandedHotels(newExpanded);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
            <span className="font-semibold">{bookings.length} Total Bookings</span>
          </div>
        </div>

        {/* Bookings Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">Loading Bookings...</h3>
            <p className="text-gray-500">Fetching booking details and enriching data</p>
          </div>
        ) : Object.keys(groupedBookings).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">📅</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">When customers make bookings, they'll appear here organized by hotel</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBookings).map(([hotelName, hotelData]) => {
              const isExpanded = expandedHotels.has(hotelName);
              return (
                <div key={hotelName} className="space-y-4">
                  {/* Hotel Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{hotelName}</h3>
                        <p className="text-orange-100 text-sm mt-1">
                          {hotelData.bookings.length} {hotelData.bookings.length === 1 ? 'Booking' : 'Bookings'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 px-4 py-2 rounded-full">
                          <span className="text-lg font-semibold">
                            {hotelData.bookings.length} Active
                          </span>
                        </div>
                        <button
                          onClick={() => toggleHotelBookings(hotelName)}
                          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                        >
                          <span className="font-medium">
                            {isExpanded ? 'Hide Bookings' : 'Show Bookings'}
                          </span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Cards Grid - Collapsible */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                      {hotelData.bookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
