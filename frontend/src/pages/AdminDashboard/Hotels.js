import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/hotels";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  
  const fetchHotels = async () => {
    try {
      const res = await axios.get(API_URL);
      setHotels(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch hotels error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setEditingId(null);
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

    try {
      if (editingId) {
        await axiosInstance.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axiosInstance.post(API_URL, formData);
      }

      resetForm();
      fetchHotels();
    } catch (error) {
      console.error("Submit hotel error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Action failed");
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
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;

    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      setHotels(hotels.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Delete hotel error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Not authorized");
    }
  };

  return (
    <div className="space-y-10">
      {}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-6 rounded-xl space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Hotel" : "Add Hotel"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="has_pool" checked={formData.has_pool} onChange={handleChange} />
            Pool
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="has_gym" checked={formData.has_gym} onChange={handleChange} />
            Gym
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />
            Parking
          </label>
        </div>

        <button className="bg-orange-500 text-white px-6 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

{}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="border rounded-xl p-5 bg-white shadow-sm space-y-2"
            >
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p className="text-sm text-gray-600">
                {hotel.city}, {hotel.country}
              </p>

              <div className="text-sm flex gap-4">
                <span>🏊 {hotel.has_pool ? "Yes" : "No"}</span>
                <span>🏋 {hotel.has_gym ? "Yes" : "No"}</span>
                <span>🚗 {hotel.parking ? "Yes" : "No"}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="px-4 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No hotels found
          </p>
        )}
      </div>
    </div>
  );
};

export default Hotels;
