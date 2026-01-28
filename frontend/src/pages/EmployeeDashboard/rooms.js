import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Rooms = () => {
  const token = localStorage.getItem("token");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data || []);
        setError(null);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return rooms;
    return rooms.filter((room) => {
      const search = searchTerm.toLowerCase();
      return (
        room.room_name?.toLowerCase().includes(search) ||
        room.room_number?.toLowerCase().includes(search) ||
        room.description?.toLowerCase().includes(search)
      );
    });
  }, [rooms, searchTerm]);

  const totalCapacity = useMemo(
    () => filteredRooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0),
    [filteredRooms]
  );

  if (!token) {
    return <p className="text-red-500">You must be logged in to view rooms.</p>;
  }

  if (loading) {
    return <p className="text-gray-500">Loading rooms…</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!filteredRooms.length) {
    return (
      <div className="space-y-4">
        <RoomsToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <p className="text-gray-500">No rooms match your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoomsToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCardE title="Total Rooms" value={filteredRooms.length} />
        <SummaryCardE title="Total Capacity" value={totalCapacity} />
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-sm">
            <tr>
              <th className="p-4">Room</th>
              <th className="p-4">Number</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Price</th>
              <th className="p-4">Description</th>
              <th className="p-4">Images</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 text-sm">
                <td className="p-4 font-medium text-gray-900">{room.room_name || "—"}</td>
                <td className="p-4 text-gray-700">{room.room_number || "—"}</td>
                <td className="p-4 text-gray-700">{room.capacity || "—"}</td>
                <td className="p-4 text-gray-700">${Number(room.price || 0).toFixed(2)}</td>
                <td className="p-4 text-gray-500 max-w-xs">{room.description || "No description"}</td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {room.images?.length ? (
                      room.images.map((imgUrl, idx) => (
                        <img
                          key={`${room.id}-img-${idx}`}
                          src={imgUrl}
                          alt={`${room.room_name || "Room"} ${idx + 1}`}
                          className="w-14 h-14 rounded object-cover border"
                        />
                      ))
                    ) : (
                      <span className="text-gray-400">No images</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoomsToolbar = ({ searchTerm, setSearchTerm }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <h2 className="text-2xl font-semibold text-gray-800">Rooms</h2>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by name, number, or description"
      className="w-full md:w-80 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
  </div>
);

// Reuse summary card styling from employee dashboard without importing to avoid circular deps
const SummaryCardE = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default Rooms;
