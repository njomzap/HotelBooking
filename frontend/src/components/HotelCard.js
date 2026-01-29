import React from "react";
import { useNavigate } from "react-router-dom";

const HotelCard = ({ hotel, onEdit, onDelete, isAdmin = false, isUser = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/hotels/${hotel.id}`);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return stars;
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group"
    >
      <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
        {hotel.images?.length > 0 ? (
          <img
            src={`http://localhost:5000${hotel.images[0]}`}
            alt={hotel.hotel_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-4xl mb-2">🏨</div>
            <span className="text-sm italic">No image available</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800 flex-grow">
              {hotel.hotel_name}
            </h3>
            {hotel.rating && (
              <div className="flex items-center ml-2">
                <span className="text-sm font-semibold text-gray-700 mr-1">
                  {hotel.rating}
                </span>
                <div className="flex">
                  {renderStars(hotel.rating)}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <svg className="w-4 h-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {hotel.city}, {hotel.address}
          </div>

          {hotel.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {hotel.description}
            </p>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {hotel.amenities.slice(0, 3).map((amenity, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {hotel.reviews > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              {hotel.reviews} {hotel.reviews === 1 ? 'review' : 'reviews'}
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-3">
          {isAdmin && (
            <div className="flex gap-2">
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
    </div>
  );
};

export default HotelCard;
