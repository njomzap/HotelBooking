import React from "react";
import { NavLink } from "react-router-dom";

export default function EmployeeSidebar() {
  const navItemStyle =
    "block px-4 py-2 rounded-md transition text-gray-700 hover:bg-gray-100";
  const activeStyle =
    "block px-4 py-2 rounded-md bg-orange-500 text-white";

  return (
    <div className="flex flex-col p-4 space-y-2">

      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Employee Menu
      </h2>

      <NavLink
        to="/employee-dashboard"
        className={({ isActive }) => (isActive ? activeStyle : navItemStyle)}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/employee-dashboard/rooms"
        className={({ isActive }) => (isActive ? activeStyle : navItemStyle)}
      >
        Rooms
      </NavLink>

      <NavLink
        to="/employee-dashboard/bookings"
        className={({ isActive }) => (isActive ? activeStyle : navItemStyle)}
      >
        Bookings
      </NavLink>

      <NavLink
        to="/employee-dashboard/lostfound"
        className={({ isActive }) => (isActive ? activeStyle : navItemStyle)}
      >
        Lost & Found
      </NavLink>

      <NavLink
        to="/employee-dashboard/profile"
        className={({ isActive }) => (isActive ? activeStyle : navItemStyle)}
      >
        Profile
      </NavLink>
    </div>
  );
}
