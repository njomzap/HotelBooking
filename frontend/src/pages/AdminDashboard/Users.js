import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      } else {
        alert("Failed to fetch users");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await axiosInstance.patch(`/users/role/${id}`, { role });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      } else {
        alert("Failed to update role");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Users</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {filteredUsers.length === 0 && <p>No users found.</p>}

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex justify-between bg-white border p-4 rounded-lg"
          >
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
            </div>

            {user.role !== "admin" && (
              <button
                onClick={() =>
                  updateRole(
                    user.id,
                    user.role === "employee" ? "user" : "employee"
                  )
                }
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                {user.role === "employee" ? "Change to User" : "Change to Employee"}
              </button>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
