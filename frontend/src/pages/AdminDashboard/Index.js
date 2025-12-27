import React, { useState } from "react";
import Users from "./Users";
import Rooms from "./Rooms";
import Hotels from "./Hotels";
import Bookings from "./Bookings";
import Profile from "./Profile";
import Navbar from "../../components/Navbar";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  const renderTab = () => {
    switch (activeTab) {
      case "users":
        return <Users />;
      case "rooms":
        return <Rooms />;
      case "hotels":
        return <Hotels />;
      case "bookings":
        return <Bookings />;
      case "profile":
        return <Profile />;
      default:
        return <Users />;
    }
  };

  const menuButton = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-4 py-3 rounded-lg transition font-medium
        ${
          activeTab === tab
            ? "bg-orange-500 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <div className="flex pt-20">
        <aside className="w-64 bg-gray-900 min-h-screen p-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-8">
            Admin Panel
          </h2>

          <nav className="space-y-2">
            {menuButton("users", "Users")}
            {menuButton("hotels", "Hotels")}
            {menuButton("rooms", "Rooms")}
            {menuButton("bookings", "Bookings")}
            {menuButton("profile", "Profile")}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>

            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

