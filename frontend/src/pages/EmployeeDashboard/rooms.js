import React, { useEffect, useState } from "react";
import axios from "axios";

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

  // Normalize backend room object to frontend-friendly keys
  const normalizeRoom = (room) => ({
    id: room.id,
    hotel_id: room.hotel_id ?? room.hotelId,
    room_name: room.room_name ?? room.name,
    room_number: room.room_number ?? room.number,
    description: room.description ?? room.desc,
    price: room.price,
    capacity: room.capacity,
    images: room.images ?? [],
  });

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get(API_URL);
      setRooms(res.data.map(normalizeRoom));
    } catch (error) {
      console.error("Error fetching rooms", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  // Reset form
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
    data.append("hotel_id", formData.hotel_id);
    data.append("room_name", formData.room_name);
    data.append("room_number", formData.room_number);
    data.append("description", formData.description);
    data.append("price", Number(formData.price));
    data.append("capacity", Number(formData.capacity));

    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }

    try {
      let response;

      if (editingId) {
        // Update existing room
        response = await axios.put(`${API_URL}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setRooms(rooms.map((room) =>
          room.id === editingId ? normalizeRoom(response.data) : room
        ));
        setEditingId(null);
      } else {
        // Create new room
        response = await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setRooms((prevRooms) => [...prevRooms, normalizeRoom(response.data)]);
      }

      resetForm();
    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("BACKEND RESPONSE:", error.response?.data);
      alert(JSON.stringify(error.response?.data || error.message));
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
      images: [], // reset images, user can re-upload
    });
  };

  // Delete a room
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRooms(rooms.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Error deleting room", error);
    }
  };

  return (
    <div className="space-y-10">
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-6 rounded-lg border space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Room" : "Add Room"}
        </h2>

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
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="border rounded px-3 py-2"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex gap-4">
          <button className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Room</th>
              <th className="p-3">Number</th>
              <th className="p-3">Price</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rooms.length > 0 ? (
              rooms.map((room, idx) => (
                <tr
                  key={room.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3">{room.room_name}</td>
                  <td className="p-3">{room.room_number}</td>
                  <td className="p-3">${room.price}</td>
                  <td className="p-3">{room.capacity}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No rooms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rooms;
