import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "/users";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedHotels, setExpandedHotels] = useState(new Set());

  const fetchEmployees = async () => {
    try {
      const res = await api.get(API_URL);
      const filtered = res.data.filter((user) => user.role === "employee");
      setEmployees(filtered);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/hotels");
      setHotels(res.data);
    } catch (error) {
      console.error("Failed to fetch hotels", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchHotels();
  }, []);

  // Group employees by hotel
  const groupEmployeesByHotel = () => {
    const grouped = {};
    
    // Add employees with hotel assignments
    employees.forEach((employee) => {
      const hotel = hotels.find(h => h.id === employee.hotel_id);
      const hotelName = hotel ? hotel.name : 'Unassigned';
      
      if (!grouped[hotelName]) {
        grouped[hotelName] = {
          hotel: hotel,
          employees: []
        };
      }
      grouped[hotelName].employees.push(employee);
    });
    
    return grouped;
  };

  const groupedEmployees = groupEmployeesByHotel();

  const toggleHotelEmployees = (hotelName) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelName)) {
      newExpanded.delete(hotelName);
    } else {
      newExpanded.add(hotelName);
    }
    setExpandedHotels(newExpanded);
  };

  const searchFiltered = employees.filter((emp) =>
    emp.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Employees Management</h1>
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <span className="font-semibold">{employees.length} Total Employees</span>
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Employees Display */}
          {employees.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-50">👥</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No Employees Found</h3>
              <p className="text-gray-500">When employees are added to the system, they'll appear here organized by hotel</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEmployees).map(([hotelName, hotelData]) => {
                const isExpanded = expandedHotels.has(hotelName);
                return (
                  <div key={hotelName} className="space-y-4">
                    {/* Hotel Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{hotelName}</h3>
                          <p className="text-orange-100 text-sm mt-1">
                            {hotelData.hotel?.location || 'Location not specified'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 px-4 py-2 rounded-full">
                            <span className="text-lg font-semibold">
                              {hotelData.employees.length} {hotelData.employees.length === 1 ? 'Employee' : 'Employees'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleHotelEmployees(hotelName)}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                          >
                            <span className="font-medium">
                              {isExpanded ? 'Hide Employees' : 'Show Employees'}
                            </span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Employee Cards Grid - Collapsible */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                        {hotelData.employees.map((employee) => (
                          <div key={employee.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">
                                  {employee.username?.charAt(0).toUpperCase() || 'E'}
                                </span>
                              </div>
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                {employee.role}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{employee.username}</h4>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>ID: {employee.id}</span>
                              </div>
                              
                              {hotelData.hotel && (
                                <div className="flex items-center gap-2 text-sm text-orange-600">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{hotelName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
