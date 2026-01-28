import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Employees", path: "/admin/employees" },
    { name: "Hotels", path: "/admin/hotels" },
    { name: "Rooms", path: "/admin/rooms" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Profile", path: "/admin/profile" },
  ];

  return (
    <aside className="w-64 bg-gray-900 min-h-screen p-6">
      <h2 className="text-2xl font-bold text-orange-500 mb-8">Admin Panel</h2>
      <nav className="flex flex-col space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`px-4 py-3 rounded-lg font-medium transition ${
              location.pathname === link.path
                ? "bg-orange-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
