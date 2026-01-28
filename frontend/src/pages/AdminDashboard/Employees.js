import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "http://localhost:5000/api/users";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL, authHeaders);

      const filtered = res.data.filter((user) => user.role === "employee");

      setEmployees(filtered);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const searchFiltered = employees.filter((emp) =>
    emp.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Employees</h1>

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {searchFiltered.length === 0 && (
          <p className="text-gray-500">No employees found.</p>
        )}

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {searchFiltered.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{emp.id}</td>
                  <td className="p-3">{emp.username}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3 capitalize">{emp.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
