import React, { useEffect, useState } from "react";
import axios from "axios";
import HotelCard from "../../components/HotelCard";

const API_URL = "http://localhost:5000/api/hotels";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);

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
      console.error("Fetch hotels error:", error);
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

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const resetForm = () => {
    setEditingId(null);
    setImages([]);
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

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    for (let i = 0; i < images.length; i++) {
      data.append("images", images[i]);
    }

    try {
      if (editingId) {
        await axiosInstance.put(`${API_URL}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      fetchHotels();
    } catch (error) {
      console.error("Submit hotel error:", error.response?.data || error.message);
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;

    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      fetchHotels();
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-10">
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

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded"
        />

        <div className="flex gap-6">
          <label><input type="checkbox" name="has_pool" checked={formData.has_pool} onChange={handleChange} /> Pool</label>
          <label><input type="checkbox" name="has_gym" checked={formData.has_gym} onChange={handleChange} /> Gym</label>
          <label><input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} /> Parking</label>
        </div>

        <button className="bg-orange-500 text-white px-6 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin
          />
        ))}
      </div>
    </div>
  );
};

export default Hotels;
