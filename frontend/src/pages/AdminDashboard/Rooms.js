import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/rooms";

export default function Rooms() {
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

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(API_URL, authHeaders);
      setRooms(res.data);
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
      for (let img of formData.images) data.append("images", img);
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
    <AdminLayout>
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded border">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Room" : "Add Room"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="hotel_id"
              placeholder="Hotel ID"
              value={formData.hotel_id}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="room_name"
              placeholder="Room Name"
              value={formData.room_name}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="room_number"
              placeholder="Room Number"
              value={formData.room_number}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              name="capacity"
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-4"
          />

          <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded">
            {editingId ? "Update" : "Create"}
          </button>
        </form>

        <table className="w-full border">
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
            {rooms.map((room) => (
              <tr key={room.id} className="border-t">
                <td className="p-3">{room.room_name}</td>
                <td className="p-3">{room.room_number}</td>
                <td className="p-3">${room.price}</td>
                <td className="p-3">{room.capacity}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="bg-orange-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

