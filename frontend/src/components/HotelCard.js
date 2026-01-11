import React from "react";
import { useNavigate } from "react-router-dom";

const HotelCard = ({ hotel, onEdit, onDelete, isAdmin = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/hotels/${hotel.id}`);
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(hotel);
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(hotel.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {}
      <div className="h-52 w-full overflow-hidden bg-gray-100">
        {hotel.images && hotel.images.length > 0 ? (
          <img
            src={`http://localhost:5000${hotel.images[0]}`}
            alt={hotel.hotel_name}
            className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
            No image available
          </div>
        )}
      </div>

      {}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">{hotel.hotel_name}</h3>
          <p className="text-sm text-gray-500">{hotel.city}</p>
          <p className="text-sm text-gray-500">Address: {hotel.address}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-orange-500 text-lg">${hotel.price_per_night}</span>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
