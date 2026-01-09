import React from "react";
import { useNavigate } from "react-router-dom";

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
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      <div className="h-48 w-full overflow-hidden bg-gray-200">
        {room.images && room.images.length > 0 ? (
          <img
            src={`http://localhost:5000${room.images[0]}`}
            alt={room.room_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{room.room_name}</h3>
        <p className="text-sm text-gray-600">Room #{room.room_number}</p>
        <p className="text-sm">Capacity: {room.capacity}</p>
        <p className="font-bold text-orange-500">${room.price}</p>

        {isAdmin && (
          <div className="flex gap-2 pt-3">
            <button
              onClick={handleEditClick}
              className="flex-1 bg-orange-500 text-white py-1 rounded hover:bg-orange-600"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
