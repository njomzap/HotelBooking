import React, { useEffect, useState } from "react";
import axios from "axios";
import RoomCard from "../../components/RoomCard";

const API_URL = "http://localhost:5000/api/rooms";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    hotel_id: "",
    room_name: "",
    room_number: "",
    description: "",
    price: "",
    capacity: "",
    images: [],
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios instance with Authorization header
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get(API_URL);
      setRooms(res.data);
    } catch (error) {
      console.error("Fetch rooms error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
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

  // Create or update room
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "images") data.append(key, formData[key]);
    });

    // Append all images
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
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
      fetchRooms();
    } catch (error) {
      console.error("Submit room error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Action failed");
    }
  };

  // Start editing a room
  const handleEdit = (room) => {
    setEditingId(room.id);
    setFormData({
      hotel_id: room.hotel_id,
      room_name: room.room_name,
      room_number: room.room_number,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      images: [],
    });
  };

  // Delete a room
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;

    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
      setRooms(rooms.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Not authorized");
    }
  };

  return (
    <div className="space-y-10">
      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? "Edit Room" : "Add Room"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="hotel_id"
            placeholder="Hotel ID"
            value={formData.hotel_id}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="room_name"
            placeholder="Room Name"
            value={formData.room_name}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="room_number"
            placeholder="Room Number"
            value={formData.room_number}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            name="capacity"
            type="number"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <button className="bg-orange-500 text-white px-6 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      {/* ROOM GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">No rooms found</p>
        )}
      </div>
    </div>
  );
};

export default Rooms;
