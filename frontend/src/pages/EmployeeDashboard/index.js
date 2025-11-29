import React, { useState } from "react";
import Rooms from "./rooms";
import Bookings from "./bookings";
import Profile from "./profile";
import Navbar from "../../components/Navbar"; 

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("rooms");

  const renderTab = () => {
    switch (activeTab) {
      case "rooms":
        return <Rooms />;
      case "bookings":
        return <Bookings />;
      case "profile":
        return <Profile />;
      default:
        return <Rooms />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 rounded ${
              activeTab === "rooms" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded ${
              activeTab === "bookings"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded ${
              activeTab === "profile"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Profile
          </button>
        </div>

        
        <div className="bg-white p-6 rounded shadow">{renderTab()}</div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
