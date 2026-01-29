import React, { useEffect, useState } from "react";
import axios from "axios";
import RoomCard from "../../components/RoomCard";

const API_URL = "http://localhost:5000/api/rooms";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    room_name: "",
    room_number: "",
    capacity: "",
    price: "",
    description: "",
    hotel_id: "",
  });

  const [hotels, setHotels] = useState([]);

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchRooms = async () => {
    try {
      const res = await axios.get(API_URL);
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hotels");
      setHotels(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch hotels error:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleImageChange = (e) => setImages(e.target.files);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    setImages(droppedFiles);
    setErrors({ ...errors, images: false });
  };

  const resetForm = () => {
    setEditingId(null);
    setImages([]);
    setErrors({});
    setIsDragging(false);
    setFormData({
      room_name: "",
      room_number: "",
      capacity: "",
      price: "",
      description: "",
      hotel_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["room_name", "room_number", "capacity", "price", "hotel_id"];
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = true;
    });

    if (images.length === 0 && !editingId) {
      newErrors.images = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill all required fields and upload at least one image.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    for (let i = 0; i < images.length; i++) data.append("images", images[i]);

    try {
      if (editingId) {
        await axiosInstance.put(`${API_URL}/${editingId}`, data);
      } else {
        await axiosInstance.post(API_URL, data);
      }
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error(error);
      alert("Room action failed");
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setFormData({
      room_name: room.room_name,
      room_number: room.room_number,
      capacity: room.capacity,
      price: room.price,
      description: room.description,
      hotel_id: room.hotel_id,
    });
    setImages([]);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      fetchRooms();
    } catch {
      alert("Delete failed");
    }
  };

  return (
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
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <input
                  name="room_name"
                  placeholder="Room Name"
                  value={formData.room_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.room_name 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.room_name && (
                  <p className="text-red-500 text-xs">Required field</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  name="room_number"
                  placeholder="Room Number"
                  value={formData.room_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.room_number 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.room_number && (
                  <p className="text-red-500 text-xs">Required field</p>
                )}
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
                    errors.capacity 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-xs">Required field</p>
                )}
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
                    errors.price 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs">Required field</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Hotel</label>
                <select
                  name="hotel_id"
                  value={formData.hotel_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.hotel_id 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
                {errors.hotel_id && (
                  <p className="text-red-500 text-xs">Required field</p>
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Room Images
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? "border-orange-500 bg-orange-50" 
                    : errors.images 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {isDragging ? "Drop images here" : "Drag & drop images here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs">At least one image is required</p>
              )}
              {images.length > 0 && (
                <p className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {images.length} image{images.length > 1 ? 's' : ''} selected
                </p>
              )}
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
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Room Management
            </h2>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
            </div>
          </div>
          
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 opacity-50">🏨</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Rooms Added</h3>
              <p className="text-gray-500 text-sm">Add your first room using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} isAdmin />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
