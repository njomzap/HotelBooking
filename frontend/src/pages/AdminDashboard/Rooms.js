import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/rooms";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const [formData, setFormData] = useState({
    hotel_id: "",
    room_name: "",
    room_number: "",
    description: "",
    price: "",
    capacity: "",
    images: [],
  });

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const normalizeRoom = (room) => ({
    id: room.id,
    hotel_id: room.hotel_id,
    room_name: room.room_name,
    room_number: room.room_number,
    description: room.description,
    price: room.price,
    capacity: room.capacity,
    images: room.images || [],
  });

  const fetchRooms = async () => {
    try {
      const res = await axios.get(API_URL, authHeaders);
      setRooms(res.data.map(normalizeRoom));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setFormData({ ...formData, images: e.target.files });

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
      if (key !== "images") data.append(key, formData[key]);
    });

    if (formData.images.length > 0) {
      for (let img of formData.images) {
        data.append("images", img);
      }
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data, authHeaders);
      } else {
        await axios.post(API_URL, data, authHeaders);
      }

      fetchRooms();
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setFormData(room);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    await axios.delete(`${API_URL}/${id}`, authHeaders);
    fetchRooms();
  };

  return (
    <div className="space-y-8">
      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded border">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Room" : "Add Room"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="hotel_id" placeholder="Hotel ID" onChange={handleChange} value={formData.hotel_id} className="border p-2 rounded" />
            <input name="room_name" placeholder="Room Name" onChange={handleChange} value={formData.room_name} className="border p-2 rounded" />
            <input name="room_number" placeholder="Room Number" onChange={handleChange} value={formData.room_number} className="border p-2 rounded" />
            <input name="price" type="number" placeholder="Price" onChange={handleChange} value={formData.price} className="border p-2 rounded" />
            <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} value={formData.capacity} className="border p-2 rounded" />
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            className="w-full border p-2 rounded mt-4"
          />

          <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Room</th>
            <th className="p-3">Number</th>
            <th className="p-3">Price</th>
            <th className="p-3">Capacity</th>
            {isAdmin && <th className="p-3">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-t">
              <td className="p-3">{room.room_name}</td>
              <td className="p-3">{room.room_number}</td>
              <td className="p-3">${room.price}</td>
              <td className="p-3">{room.capacity}</td>
              {isAdmin && (
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(room)} className="bg-orange-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rooms;
