import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import HotelCard from "../../components/HotelCard";

const API_URL = "http://localhost:5000/api/hotels";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    country: "",
    has_pool: false,
    has_gym: false,
    parking: false,
  });

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchHotels = async () => {
    try {
      const res = await axios.get(API_URL);
      setHotels(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch hotels error:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: false }); // clear error on change
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
      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      country: "",
      has_pool: false,
      has_gym: false,
      parking: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "address", "city", "phone", "email", "country"];
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
      fetchHotels();
    } catch (error) {
      console.error(error);
      alert("Hotel action failed");
    }
  };

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);
    setFormData({
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      phone: hotel.phone,
      email: hotel.email,
      country: hotel.country,
      has_pool: !!hotel.has_pool,
      has_gym: !!hotel.has_gym,
      parking: !!hotel.parking,
    });
    setImages([]);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      fetchHotels();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {editingId ? "Edit Hotel" : "Add New Hotel"}
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {editingId ? "Update hotel information" : "Enter hotel details to create a new listing"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["name", "address", "city", "phone", "email", "country"].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors[field] 
                        ? "border-red-500 bg-red-50" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-xs">Required field</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Hotel Images
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

            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Amenities & Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    name="has_pool" 
                    checked={formData.has_pool} 
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 text-sm">🏊 Swimming Pool</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    name="has_gym" 
                    checked={formData.has_gym} 
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 text-sm">🏋️ Fitness Center</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    name="parking" 
                    checked={formData.parking} 
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 text-sm">🚗 Parking</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm"
              >
                {editingId ? "Update Hotel" : "Create Hotel"}
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
              Hotel Management
            </h2>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'}
            </div>
          </div>
          
          {hotels.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 opacity-50">🏨</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Hotels Added</h3>
              <p className="text-gray-500 text-sm">Add your first hotel using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onEdit={handleEdit} onDelete={handleDelete} isAdmin />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
