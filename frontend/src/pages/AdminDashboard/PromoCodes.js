import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/promo-codes";

const defaultForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  start_date: "",
  end_date: "",
  usage_limit: "",
  active: true,
};

const formatDateInput = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

export default function PromoCodes() {
  const token = localStorage.getItem("token");
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/");
      setPromoCodes(res.data || []);
      setError(null);
    } catch (err) {
      console.error("PROMO FETCH ERROR:", err);
      setError(err.response?.data?.message || "Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPromoCodes();
  }, [token]);

  const openCreateModal = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      start_date: formatDateInput(promo.start_date),
      end_date: formatDateInput(promo.end_date),
      usage_limit: promo.usage_limit ?? "",
      active: promo.active,
    });
    setEditingId(promo.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/${editingId}`, payload);
      } else {
        await axiosInstance.post("/", payload);
      }
      closeModal();
      fetchPromoCodes();
    } catch (err) {
      console.error("PROMO SAVE ERROR:", err);
      alert(err.response?.data?.message || "Failed to save promo code");
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axiosInstance.delete(`/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchPromoCodes();
    } catch (err) {
      console.error("PROMO DELETE ERROR:", err);
      alert(err.response?.data?.message || "Failed to delete promo code");
    }
  };

  const filteredPromos = useMemo(() => {
    if (!search.trim()) return promoCodes;
    const term = search.toLowerCase();
    return promoCodes.filter((promo) =>
      promo.code.toLowerCase().includes(term)
    );
  }, [promoCodes, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Promo Codes</h1>
            <p className="text-gray-500">Create and manage discount codes for bookings.</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={openCreateModal}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
            >
              + New Promo
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading promo codes…</p>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : filteredPromos.length === 0 ? (
          <div className="text-gray-500">No promo codes found.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="text-sm text-gray-700">
                    <td className="p-4 font-semibold">{promo.code}</td>
                    <td className="p-4">
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : `$${Number(promo.discount_value).toFixed(2)}`}
                    </td>
                    <td className="p-4">
                      {formatDateInput(promo.start_date)} – {formatDateInput(promo.end_date)}
                    </td>
                    <td className="p-4">
                      {promo.usage_limit
                        ? `${promo.usage_count}/${promo.usage_limit}`
                        : `${promo.usage_count} / ∞`}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          promo.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {promo.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => openEditModal(promo)}
                        className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(promo.id)}
                        className="px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {editingId ? "Edit Promo Code" : "Create Promo Code"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-600">Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Discount Type</label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Value</label>
                  <input
                    type="number"
                    name="discount_value"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Usage Limit (leave blank for unlimited)</label>
                <input
                  type="number"
                  name="usage_limit"
                  min="1"
                  value={form.usage_limit}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="rounded"
                />
                Active
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
                >
                  {editingId ? "Save Changes" : "Create Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Delete Promo Code?</h3>
            <p className="text-gray-600">
              This action cannot be undone. Users will no longer be able to apply this code.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
