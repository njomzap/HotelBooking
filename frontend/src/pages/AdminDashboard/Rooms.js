import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import RoomCard from "../../components/RoomCard";

const API_URL = "/rooms";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expandedHotels, setExpandedHotels] = useState(new Set());

  const [formData, setFormData] = useState({
    hotel_id: "",
    room_name: "",
    room_number: "",
    description: "",
    price: "",
    capacity: "",
    images: [],
  });

  const token = localStorage.getItem("accessToken");

  const fetchRooms = async () => {
    try {
      const res = await api.get(API_URL);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
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
    fetchRooms();
    fetchHotels();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setFormData({ ...formData, images: filesArray });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      hotel_id: "",
      room_name: "",
      room_number: "",
      description: "",
      price: "",
      capacity: "",
      images: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "images") {
        if (typeof formData[key] === 'string') {
          data.append(key, formData[key]);
        } else {
          data.append(key, String(formData[key]));
        }
      }
    });

    // Add all image files
    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }

    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, data);
      } else {
        await api.post(API_URL, data);
      }
      fetchRooms();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save room");
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setFormData(room);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    await api.delete(`${API_URL}/${id}`);
    fetchRooms();
  };

  const toggleHotelRooms = (hotelId) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelId)) {
      newExpanded.delete(hotelId);
    } else {
      newExpanded.add(hotelId);
    }
    setExpandedHotels(newExpanded);
  };

  // Group rooms by hotel
  const groupRoomsByHotel = () => {
    const grouped = {};
    rooms.forEach((room) => {
      const hotel = hotels.find(h => h.id === room.hotel_id);
      const hotelName = hotel ? hotel.name : 'Unknown Hotel';
      if (!grouped[hotelName]) {
        grouped[hotelName] = {
          hotel: hotel,
          rooms: []
        };
      }
      grouped[hotelName].rooms.push(room);
    });
    return grouped;
  };

  const groupedRooms = groupRoomsByHotel();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Room" : "Add New Room"}
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                {editingId ? "Update room information" : "Enter room details to create a new listing"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Hotel</label>
                  <select
                    name="hotel_id"
                    value={formData.hotel_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !formData.hotel_id ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  >
                    <option value="">Select Hotel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <input
                    name="room_name"
                    placeholder="Room Name"
                    value={formData.room_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !formData.room_name ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <input
                    name="room_number"
                    placeholder="Room Number"
                    value={formData.room_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !formData.room_number ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Price (€)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !formData.price ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    placeholder="Capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      !formData.capacity ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                </div>

                {/* Simple Image Upload */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3"
                  />
                  <p className="text-xs text-gray-500">
                    Hold Ctrl/Cmd and click to select multiple images
                  </p>
                  {formData.images && formData.images.length > 0 && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {formData.images.length} image{formData.images.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Room description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all border-gray-300 hover:border-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm"
                >
                  {editingId ? "Update Room" : "Create Room"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

        {Object.keys(groupedRooms).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 opacity-50">🏨</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Rooms Added</h3>
            <p className="text-gray-500 text-sm">Add your first room using the form above</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRooms).map(([hotelName, hotelData]) => {
              const isExpanded = expandedHotels.has(hotelData.hotel?.id);
              return (
                <div key={hotelName} className="space-y-4">
                  {/* Hotel Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{hotelName}</h3>
                        <p className="text-orange-100 text-sm mt-1">
                          {hotelData.hotel?.location || 'Location not specified'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 px-4 py-2 rounded-full">
                          <span className="text-lg font-semibold">
                            {hotelData.rooms.length} {hotelData.rooms.length === 1 ? 'Room' : 'Rooms'}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleHotelRooms(hotelData.hotel?.id)}
                          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                        >
                          <span className="font-medium">
                            {isExpanded ? 'Hide Rooms' : 'Show Rooms'}
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
                  
                  {/* Room Cards Grid - Collapsible */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                      {hotelData.rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={{
                            ...room,
                            hotel_name: hotelName
                          }}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isAdmin={true}
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
      </div>
    </AdminLayout>
  );
}

