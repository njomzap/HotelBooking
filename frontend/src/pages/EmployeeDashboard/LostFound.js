import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Package, MapPin, Calendar, User, Mail, AlertCircle, CheckCircle } from "lucide-react";

const EmployeeLostFound = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [assignmentError, setAssignmentError] = useState("");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const assignedHotelId = localStorage.getItem("hotelId");

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        if (!token) {
          setLostItems([]);
          setLoading(false);
          return;
        }

        if (role === "employee" && !assignedHotelId) {
          setAssignmentError("You are not assigned to a hotel yet. Please contact an administrator to link your account before managing lost and found items.");
          setLostItems([]);
          setLoading(false);
          return;
        }

        setAssignmentError("");
        const res = await axios.get("http://localhost:5000/api/lostfound", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setLostItems(res.data);
      } catch (error) {
        console.error("Error fetching lost items:", error);
        setLostItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, [token, role, assignedHotelId]);

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || 
                          (selectedStatus === "claimed" && item.claimed) ||
                          (selectedStatus === "unclaimed" && !item.claimed);
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusToggle = async (itemId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Toggling status for item:", itemId, "current status:", currentStatus, "new status:", !currentStatus);
      
      const res = await axios.put(
        `http://localhost:5000/api/lostfound/${itemId}`,
        { claimed: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Response from server:", res.data);
      
      // Update the item in the list with the response data
      setLostItems(prev => {
        console.log("Previous items:", prev);
        const updated = prev.map(item => 
          item.id === itemId ? res.data : item
        );
        console.log("Updated items:", updated);
        return updated;
      });
    } catch (error) {
      console.error("Error updating item status:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to update item status");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/lostfound/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setLostItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };

  if (assignmentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-dashed border-orange-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">
            !
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hotel assignment required</h2>
          <p className="text-gray-600">{assignmentError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lost & Found Management</h1>
            <p className="text-orange-100">Manage lost and found items across all hotels</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{lostItems.length}</div>
            <div className="text-orange-100 text-sm">Total Items</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{lostItems.filter(item => !item.claimed).length}</div>
            <div className="text-orange-100 text-sm">Unclaimed</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{lostItems.filter(item => item.claimed).length}</div>
            <div className="text-orange-100 text-sm">Claimed</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lost Items Found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "No lost items have been reported yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                      {item.claimed ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Unclaimed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date_found).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{item.name || item.username || 'Guest'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>{item.email || 'No email provided'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleStatusToggle(item.id, item.claimed)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        item.claimed
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {item.claimed ? "Mark Unclaimed" : "Mark Claimed"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLostFound;
