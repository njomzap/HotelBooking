import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setSelectedHotels((prev) => {
        const mapping = { ...prev };
        res.data.forEach((user) => {
          if (user.hotel_id) {
            mapping[user.id] = user.hotel_id;
          }
        });
        return mapping;
      });
    } catch (err) {
      console.error("Failed to fetch users", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        alert("Failed to fetch users");
      }
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/hotels");
      setHotels(res.data || []);
    } catch (err) {
      console.error("Failed to fetch hotels", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHotels();
  }, []);

  const updateRole = async (id, role) => {
    try {
      const payload = { role };

      if (role === "employee") {
        const hotelId = selectedHotels[id];
        if (!hotelId) {
          alert("Please select a hotel for this employee before saving.");
          return;
        }
        payload.hotel_id = hotelId;
      }

      await api.patch(`/users/role/${id}`, payload);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        alert("Failed to update role");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleHotelChange = (userId, hotelId) => {
    setSelectedHotels((prev) => ({
      ...prev,
      [userId]: hotelId,
    }));
  };

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

        {filteredUsers.map((user) => {
          const nextRole = user.role === "employee" ? "user" : "employee";
          const assignedHotelName = user.hotel_name || "Not assigned";

          return (
            <div
              key={user.id}
              className="bg-white border p-4 rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-lg">{user.username}</p>
                <p className="text-sm text-gray-500 capitalize">Role: {user.role}</p>
                <p className="text-sm text-gray-500">Hotel: {assignedHotelName}</p>
              </div>

              {user.role !== "admin" && (
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {nextRole === "employee" && (
                    <select
                      value={selectedHotels[user.id] || ""}
                      onChange={(e) => handleHotelChange(user.id, e.target.value)}
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => updateRole(user.id, nextRole)}
                    className="bg-orange-500 text-white px-4 py-2 rounded"
                  >
                    {nextRole === "employee" ? "Change to Employee" : "Change to User"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
