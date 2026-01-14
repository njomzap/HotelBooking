import React, { useEffect, useState } from "react";
import axios from "axios";

const LostFound = () => {
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
      const res = await axios.get("http://localhost:5000/api/lostfound");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/lostfound", form);
      setForm({ item_name: "", description: "", date_found: "", location: "", claimed: false });
      setShowAddForm(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lostfound/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      item_name: item.item_name,
      description: item.description,
      date_found: item.date_found,
      location: item.location,
      claimed: item.claimed,
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/lostfound/${editItem.id}`, form);
      setEditItem(null);
      setForm({ item_name: "", description: "", date_found: "", location: "", claimed: false });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Lost & Found Management</h1>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        {showAddForm ? "Cancel" : "Add New Item"}
      </button>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 bg-orange-50 p-5 rounded-2xl shadow-md border border-orange-200"
        >
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Item Name</th>
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
                  No lost & found items.
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
                      onClick={() => handleEdit(item)}
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

      
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Edit Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                className="w-full border border-orange-300 rounded px-3 py-2"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-orange-300 rounded px-3 py-2"
                required
              />
              <input
                type="date"
                name="date_found"
                value={form.date_found}
                onChange={handleChange}
                className="w-full border border-orange-300 rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-orange-300 rounded px-3 py-2"
                required
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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
