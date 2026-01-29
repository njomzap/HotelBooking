import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Edit, Trash2 } from "lucide-react";

const RoomCard = ({ room, onEdit, onDelete, isAdmin = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/rooms/${room.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(room);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(room.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group transform hover:scale-[1.02]"
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
        {room.images && room.images.length > 0 ? (
          <img
            src={`http://localhost:5000${room.images[0]}`}
            alt={room.room_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-orange-400">
            <div className="text-5xl mb-2">🏨</div>
            <span className="text-sm font-medium">No image available</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-orange-200">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-orange-600">€{room.price}</span>
            <span className="text-xs text-gray-500">/night</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Room Name and Number */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {room.room_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-orange-700">{room.room_number}</span>
            </div>
            <span>Room #{room.room_number}</span>
          </div>
        </div>

        {/* Room Details */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">{room.capacity} guests</span>
          </div>
          
          {room.hotel_name && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900 text-sm">{room.hotel_name}</span>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={handleEditClick}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
