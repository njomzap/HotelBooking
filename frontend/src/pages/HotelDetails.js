import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import RoomCard from "../components/RoomCard";
import ReviewsList from "../components/reviewsList";

const isLoggedIn = true;

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [lostItems, setLostItems] = useState([]);
  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    date_found: "",
    location: ""
  });
  const [lfLoading, setLfLoading] = useState(true);

  
  const fetchHotel = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hotels/${id}`);
      setHotel(res.data);
    } catch (err) {
      console.error("Error fetching hotel:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRooms = useCallback(async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/rooms/hotel/${id}`
    );
    setRooms(res.data);
  } catch (err) {
    console.error("Error fetching rooms:", err);
  } finally {
    setRoomsLoading(false);
  }
}, [id]);


  const fetchLostItems = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/lostfound?hotel_id=${id}`);
      setLostItems(res.data);
    } catch (err) {
      console.error("Error fetching lost & found items:", err);
    } finally {
      setLfLoading(false);
    }
  }, [id]);

  
  useEffect(() => {
    fetchHotel();
    fetchRooms();
    fetchLostItems();
  }, [fetchHotel, fetchRooms, fetchLostItems]);


  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/lostfound`, {
        ...newItem,
        hotel_id: id,
      });
      setLostItems([...lostItems, res.data]);
      setNewItem({ item_name: "", description: "", date_found: "", location: "" });
    } catch (err) {
      console.error("Error adding lost & found item:", err);
    }
  };

  
  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 font-medium">Loading hotel details...</p>
    );
  if (!hotel)
    return (
      <p className="p-6 text-center text-red-500 font-medium">Hotel not found</p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      <div>
        <h1 className="text-4xl font-bold text-orange-600 mb-2">{hotel.hotel_name}</h1>
        <p className="text-gray-500 mb-6">{hotel.city}</p>

        {hotel.images?.length ? (
          <img
            src={`http://localhost:5000${hotel.images[0]}`}
            alt={hotel.hotel_name}
            className="w-full h-96 object-cover rounded-2xl shadow-md mb-6 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-2xl shadow-md mb-6 text-gray-400 italic">
            No image available
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            <span className="font-semibold">Address:</span> {hotel.address}
          </p>
          {hotel.description && (
            <p className="text-gray-700">
              <span className="font-semibold">Description:</span> {hotel.description}
            </p>
          )}
          <div className="flex gap-4 mt-4 text-gray-600 text-sm">
            {hotel.has_pool && <span>🏊 Pool</span>}
            {hotel.has_gym && <span>🏋️ Gym</span>}
            {hotel.parking && <span>🅿️ Parking</span>}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-orange-600 mb-4">Reviews</h2>
        <ReviewsList hotelId={id} />
      </div>

   
      <div>
        <h2 className="text-2xl font-semibold text-orange-600 mb-4">Rooms</h2>
        {roomsLoading ? (
          <p className="text-gray-500">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500">No rooms available for this hotel.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

   
      <div>
        <h2 className="text-2xl font-semibold text-orange-600 mb-4">Lost & Found</h2>

        {isLoggedIn && (
          <form
            onSubmit={handleAddItem}
            className="mb-6 space-y-4 bg-orange-50 p-5 rounded-2xl shadow-md border border-orange-200"
          >
            <input
              type="text"
              name="item_name"
              placeholder="Item Name"
              value={newItem.item_name}
              onChange={handleInputChange}
              required
              className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newItem.description}
              onChange={handleInputChange}
              required
              className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <input
              type="date"
              name="date_found"
              value={newItem.date_found}
              onChange={handleInputChange}
              required
              className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <input
              type="text"
              name="location"
              placeholder="Location found"
              value={newItem.location}
              onChange={handleInputChange}
              required
              className="w-full border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Add Item
            </button>
          </form>
        )}

       
      </div>
    </div>
  );
};

export default HotelDetails;
