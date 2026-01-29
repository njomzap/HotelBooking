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
    try {
      const res = await axios.post(`http://localhost:5000/api/lostfound`, {
        ...newItem,
        hotel_id: id,
      });
      setLostItems([...lostItems, res.data]);
      setNewItem({ item_name: "", description: "", date_found: "", location: "" });
    } catch (err) {
      console.error("Error adding lost & found item:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hotel Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            {hotel.images?.length ? (
              <div className="relative">
                <img
                  src={`http://localhost:5000${hotel.images[0]}`}
                  alt={hotel.name || hotel.hotel_name}
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Bed className="w-12 h-12 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-orange-100">
          <div className="text-center">
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {hotel.name || hotel.hotel_name}
            </h1>
            <div className="flex items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold text-lg">4.5</span>
                <span className="text-sm">(128 reviews)</span>
              </div>
            </div>
          </div>

          {/* Hotel Information Cards */}
          <div className="grid md:grid-cols-1 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">Location & Contact</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-medium">Address:</span> {hotel.address}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-medium">City:</span> {hotel.city}
                    </p>
                    {hotel.phone && (
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-medium">Phone:</span> {hotel.phone}
                      </p>
                    )}
                    {hotel.email && (
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-medium">Email:</span> {hotel.email}
                      </p>
                    )}
                    {hotel.country && (
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-medium">Country:</span> {hotel.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotel.has_pool && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Waves className="w-3 h-3" />
                        Pool
                      </span>
                    )}
                    {hotel.has_gym && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Dumbbell className="w-3 h-3" />
                        Gym
                      </span>
                    )}
                    {hotel.parking && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Car className="w-3 h-3" />
                        Parking
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OpenStreetMap Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <HotelMapLeaflet address={hotel.address} city={hotel.city} />
          </div>
        </div>

        {/* Rooms Section */}
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

        {/* Reviews Section */}
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

   
        {/* Lost & Found Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Lost & Found</h2>
              <p className="text-gray-600">Report or claim lost items</p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl shadow-xl p-8 mb-8 border border-orange-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Report a Lost Item
              </h3>
              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                    <div className="relative">
                      <input
                        type="date"
                        name="date_found"
                        value={newItem.date_found}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                      />
                      <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
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
                    rows={4}
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
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          )}

          {!isLoggedIn && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-orange-100">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">Login to Report Lost Items</p>
              <p className="text-gray-400">Please sign in to access the lost & found service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
