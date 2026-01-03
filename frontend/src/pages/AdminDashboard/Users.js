import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchUsers = async () => {
    const res = await axios.get(API_URL, authHeaders);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await axios.patch(`${API_URL}/role/${id}`, { role }, authHeaders);
      fetchUsers();
    } catch {
      alert("Failed to update role");
    }
  };

  
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

     
      <div className="space-y-3">
        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-sm">No users found.</p>
        )}

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-white border rounded-lg p-4 shadow-sm hover:shadow transition"
          >
            
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">
                Role: {user.role}
              </p>
            </div>

            
            {user.role !== "admin" && (
              <button
                onClick={() =>
                  updateRole(
                    user.id,
                    user.role === "employee" ? "user" : "employee"
                  )
                }
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
              >
                {user.role === "employee"
                  ? "Change to User"
                  : "Change to Employee"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
