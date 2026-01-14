import React from "react";
import { useNavigate } from "react-router-dom";

const HotelCard = ({ hotel, onEdit, onDelete, isAdmin = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/hotels/${hotel.id}`);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
  
      <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
        {hotel.images?.length > 0 ? (
          <img
            src={`http://localhost:5000${hotel.images[0]}`}
            alt={hotel.hotel_name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
            No image available
          </div>
        )}
      </div>

  
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">
            {hotel.hotel_name}
          </h3>
          <p className="text-gray-500 text-sm">
            {hotel.city}, {hotel.address}
          </p>
          {hotel.description && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {hotel.description}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(hotel);
              }}
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(hotel.id);
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
