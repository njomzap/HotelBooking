import React, { useEffect, useState } from "react";
import axios from "axios";

const LostFound = () => {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_name: "",
    description: "",
    date_found: "",
    location: "",
    claimed: false,
  });
  const [editItem, setEditItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lostfound", authHeaders);
      setItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch lost & found items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`http://localhost:5000/api/lostfound/${editItem.id}`, form, authHeaders);
        setEditItem(null);
      } else {
        await axios.post("http://localhost:5000/api/lostfound", form, authHeaders);
      }
      setForm({ item_name: "", description: "", date_found: "", location: "", claimed: false });
      setShowAddForm(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lostfound/${id}`, authHeaders);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        {showAddForm ? "Cancel" : "Add New Item"}
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-orange-50 p-5 rounded-2xl shadow-md border border-orange-200">
          <input
            type="text"
            name="item_name"
            placeholder="Item Name"
            value={form.item_name}
            onChange={handleChange}
            required
            className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <input
            type="date"
            name="date_found"
            value={form.date_found}
            onChange={handleChange}
            required
            className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="claimed"
              checked={form.claimed}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Claimed
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {editItem ? "Save Changes" : "Add Item"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date Found</th>
              <th className="p-3">Location</th>
              <th className="p-3">Claimed</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-3 text-center">
                  No items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{item.item_name}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">{item.date_found}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.claimed ? "Yes" : "No"}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditItem(item);
                        setForm(item);
                        setShowAddForm(true);
                      }}
                      className="px-4 py-2 border border-orange-500 text-orange-500 bg-white rounded-2xl hover:bg-orange-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LostFound;
