import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapPin, Star, Wifi, Car, Dumbbell, Waves, Calendar, Package, Bed } from "lucide-react";

import RoomCard from "../components/RoomCard";
import ReviewsList from "../components/reviewsList";
import HotelMapLeaflet from "../components/HotelMapLeaflet";

const isLoggedIn = true;

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  
  const [showLostFoundModal, setShowLostFoundModal] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    date_found: "",
    location: ""
  });
  const [lfLoading, setLfLoading] = useState(true);

  
  const fetchHotel = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
      setHotel(res.data);
    } catch (err) {
      console.error("Error fetching hotel:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRooms = useCallback(async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/rooms/hotel/${id}`
    );
    setRooms(res.data);
  } catch (err) {
    console.error("Error fetching rooms:", err);
  } finally {
    setRoomsLoading(false);
  }
}, [id]);


  const fetchLostItems = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/lostfound?hotel_id=${id}`);
      setLostItems(res.data);
    } catch (err) {
      console.error("Error fetching lost & found items:", err);
    } finally {
      setLfLoading(false);
    }
  }, [id]);

  
  useEffect(() => {
    fetchHotel();
    fetchRooms();
    fetchLostItems();
  }, [fetchHotel, fetchRooms, fetchLostItems]);


  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
 
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to report lost items");
      return;
    }
    
    try {
      const res = await axios.post(`http://localhost:5000/api/lostfound`, {
        ...newItem,
        hotel_id: id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      
      setLostItems(prev => [...prev, res.data]);
      
      // Reset form
      setNewItem({ item_name: "", description: "", date_found: "", location: "" });
      
     
      alert("Lost item reported successfully!");
      
    } catch (err) {
      console.error("Error adding lost & found item:", err);
      alert("Failed to report lost item. Please try again.");
    }
  };

  const refreshLostItems = useCallback(async () => {
    setLfLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/lostfound?hotel_id=${id}`);
      setLostItems(res.data || []);
    } catch (err) {
      console.error("Error fetching lost & found items:", err);
      setLostItems([]);
    } finally {
      setLfLoading(false);
    }
  }, [id]);

  
  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 font-medium">Loading hotel details...</p>
    );
  if (!hotel)
    return (
      <p className="p-6 text-center text-red-500 font-medium">Hotel not found</p>
    );

  return (
    <div className="w-full">
   
      <div className="relative w-full h-[60vh]">
        {hotel.images?.length ? (
          <>
            <img
              src={`http://localhost:5000${hotel.images[0]}`}
              alt={hotel.name || hotel.hotel_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-orange-900/50"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-orange-900/50"></div>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-end justify-center text-center text-white px-4 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-400/30">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              Luxury Hotel Experience
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {hotel.name || hotel.hotel_name}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-orange-100">
            <div className="grid md:grid-cols-2 gap-8">
              
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Location & Contact</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-semibold">Address:</span> {hotel.address}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">City:</span> {hotel.city}
                  </p>
                  {hotel.phone && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Phone:</span> {hotel.phone}
                    </p>
                  )}
                  {hotel.email && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Email:</span> {hotel.email}
                    </p>
                  )}
                  {hotel.country && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Country:</span> {hotel.country}
                    </p>
                  )}
                </div>
              </div>

              
              {/* Show amenities section only if hotel has at least one amenity */}
              {(hotel.has_pool === 1 || 
                hotel.has_gym === 1 || 
                hotel.parking === 1 ||
                hotel.wifi === 1) && (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Amenities</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {hotel.has_pool === 1 && (
                      <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Waves className="w-4 h-4" />
                        Swimming Pool
                      </span>
                    )}
                    {hotel.has_gym === 1 && (
                      <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Dumbbell className="w-4 h-4" />
                        Fitness Center
                      </span>
                    )}
                    {hotel.parking === 1 && (
                      <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Car className="w-4 h-4" />
                        Free Parking
                      </span>
                    )}
                    {hotel.wifi === 1 && (
                      <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Wifi className="w-4 h-4" />
                        WiFi
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

           
            <div className="mt-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Hotel Location
                </h3>
                <HotelMapLeaflet address={hotel.address} city={hotel.city} />
              </div>
            </div>
          </div>

          {/* Reviews Section - Only show for logged-in users */}
          {isLoggedIn && (
            <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Guest Reviews</h2>
                <p className="text-gray-600">See what our guests are saying</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
              <ReviewsList hotelId={id} />
            </div>
          </div>
          )}

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Available Rooms</h2>
                <p className="text-gray-600">Choose your perfect stay</p>
              </div>
            </div>
            {roomsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-orange-100">
                <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No rooms available for this hotel.</p>
                <p className="text-gray-400 mt-2">Please check back later or contact us for assistance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            setShowLostFoundModal(true);
            refreshLostItems(); // Refresh items when modal opens
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-110 flex items-center gap-3 font-medium"
        >
          <Package className="w-6 h-6" />
          Lost & Found
        </button>
      </div>

      
      {showLostFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLostFoundModal(false)}
          />
          
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Lost & Found</h2>
                    <p className="text-orange-100">Report or claim lost items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLostFoundModal(false)}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {lfLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              ) : (
                <>
                 
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Lost Items</h3>
                    {lostItems.length === 0 ? (
                      <div className="bg-gray-50 rounded-2xl p-8 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No lost items reported yet</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {lostItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>📍 {item.location}</span>
                                  <span>📅 {item.date_found}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                 
                  {isLoggedIn && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-600" />
                        Report a Lost Item
                      </h3>
                      <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                            <input
                              type="text"
                              name="item_name"
                              placeholder="e.g., Wallet, Phone, Keys"
                              value={newItem.item_name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Found</label>
                            <input
                              type="date"
                              name="date_found"
                              value={newItem.date_found}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            name="description"
                            placeholder="Provide a detailed description of the item..."
                            value={newItem.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location Found</label>
                          <input
                            type="text"
                            name="location"
                            placeholder="e.g., Lobby, Room 205, Pool Area"
                            value={newItem.location}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
                          >
                            <Package className="w-5 h-5" />
                            Submit Report
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-orange-100">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">Login to Report Lost Items</p>
                      <p className="text-gray-400">Please sign in to access the lost & found service.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
