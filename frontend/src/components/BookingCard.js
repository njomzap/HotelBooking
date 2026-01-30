import React from "react";
import { Users, MapPin, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const BookingCard = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:scale-[1.02]">
      {/* Header with Status */}
      <div className="relative">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Booking #{booking.id}</div>
              <div className="text-xl font-bold">{booking.user || 'Guest'}</div>
            </div>
            <div className={`px-3 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="text-white">{booking.status || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Hotel & Room Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-orange-900">{booking.hotel || 'Hotel Name'}</div>
              <div className="text-sm text-orange-700">{booking.room || 'Room Name'}</div>
            </div>
          </div>

          {/* Date & Capacity */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-purple-600 uppercase font-medium">Guests</div>
              <div className="text-sm font-semibold text-purple-900">{booking.guests || 1}</div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-amber-600 uppercase font-medium">Total Price</div>
              <div className="text-lg font-bold text-amber-900">${booking.total_price || booking.price || '0'}</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(booking.check_in || booking.check_out) && (
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {booking.check_in && (
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <span className="ml-2 font-medium">{formatDate(booking.check_in)}</span>
                </div>
              )}
              {booking.check_out && (
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <span className="ml-2 font-medium">{formatDate(booking.check_out)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
