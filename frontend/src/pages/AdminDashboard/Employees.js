import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import { MapPin, Users, Mail, Building } from "lucide-react";

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
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  {employees.length} {employees.length === 1 ? 'Employee' : 'Employees'}
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <p className="text-gray-600 mt-2">Manage and monitor all hotel employees</p>
          </div>

          {/* Employees Display */}
          {employees.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Employees Found</h3>
              <p className="text-gray-600">When employees are added to the system, they'll appear here organized by hotel</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEmployees).map(([hotelName, hotelData]) => {
                const isExpanded = expandedHotels.has(hotelName);
                return (
                  <div key={hotelName} className="space-y-4">
                    {/* Hotel Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{hotelName}</h3>
                            <p className="text-sm text-gray-600">
                              {hotelData.hotel?.location || 'Location not specified'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleHotelEmployees(hotelName)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                          <span>{isExpanded ? 'Hide' : 'Show'} Employees</span>
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
                    
                    {/* Employee Cards - Collapsible */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {hotelData.employees.map((employee) => (
                          <div key={employee.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
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
                                <Users className="w-4 h-4" />
                                <span>ID: {employee.id}</span>
                              </div>
                              
                              {hotelData.hotel && (
                                <div className="flex items-center gap-2 text-sm text-orange-600">
                                  <Building className="w-4 h-4" />
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
