import React from "react";
import { NavLink } from "react-router-dom";

export default function EmployeeSidebar() {
  const baseClasses =
    "block px-4 py-3 rounded-lg font-medium transition text-slate-300 hover:bg-slate-800 hover:text-white";
  const activeClasses = "block px-4 py-3 rounded-lg font-medium bg-orange-500 text-white";

  return (
    <aside className="w-64 bg-slate-900 min-h-screen border-r border-slate-800 p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-orange-400 mb-8">Employee Panel</h2>
      <nav className="flex flex-col space-y-2 text-base">

      <NavLink
        to="/employee-dashboard"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/employee-dashboard/rooms"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Rooms
      </NavLink>

      <NavLink
        to="/employee-dashboard/bookings"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Bookings
      </NavLink>

      <NavLink
        to="/employee-dashboard/lostfound"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Lost & Found
      </NavLink>

      <NavLink
        to="/employee-dashboard/promos"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Promo Codes
      </NavLink>

      <NavLink
        to="/employee-dashboard/profile"
        className={({ isActive }) => (isActive ? activeClasses : baseClasses)}
      >
        Profile
      </NavLink>
      </nav>
    </aside>
  );
}
