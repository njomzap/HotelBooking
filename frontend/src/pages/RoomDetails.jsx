import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar, Users, Home, DollarSign, Tag, MapPin } from "lucide-react";

const API_URL = "http://localhost:5000/api/rooms";
const BOOKINGS_API = "http://localhost:5000/api/bookings";
const EXTRA_REQUESTS_API = "http://localhost:5000/api/extra-requests";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [extraRequest, setExtraRequest] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoFeedback, setPromoFeedback] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [currentImage, setCurrentImage] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setRoom(res.data);
        setCurrentImage(0);
      } catch (err) {
        console.error(err);
        alert("Room not found");
      }
    };
    fetchRoom();
  }, [id]);

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 0;
  }, [checkIn, checkOut]);

  const nightlyRate = Number(room?.price || 0);
  const subtotal = nights * nightlyRate;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const totalDue = Math.max(subtotal - discountAmount, 0);

  useEffect(() => {
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoFeedback("Travel dates changed. Please reapply your promo code.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoFeedback("Enter a promo code first.");
      return;
    }

    if (!token) {
      setPromoFeedback("You must be logged in to apply a promo code.");
      return;
    }

    if (subtotal <= 0) {
      setPromoFeedback("Select valid check-in and check-out dates before applying a code.");
      return;
    }

    setApplyingPromo(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/promo-codes/apply",
        {
          code: promoCode.trim(),
          subtotal,
          room_id: room?.id,
          hotel_id: room?.hotel_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppliedPromo({
        code: promoCode.trim(),
        discountAmount: res.data.discount_amount,
      });
      setPromoFeedback(`Promo applied! You save $${res.data.discount_amount.toFixed(2)}.`);
    } catch (err) {
      console.error("APPLY PROMO ERROR:", err);
      setAppliedPromo(null);
      setPromoFeedback(err.response?.data?.message || "Failed to apply promo code.");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleBooking = async () => {
    if (!room || !room.id) {
      setMessage("Room information is still loading. Please wait.");
      return;
    }

    if (!token) {
      setMessage("You must be logged in to book a room");
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage("Please select check-in and check-out dates");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
      };

      if (appliedPromo?.code) {
        payload.promo_code = appliedPromo.code;
      }

      const bookingRes = await axios.post(BOOKINGS_API, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookingId = bookingRes.data.booking_id || bookingRes.data.id;
      setCreatedBookingId(bookingId);

      if (extraRequest.trim()) {
        await axios.post(EXTRA_REQUESTS_API, {
          booking_id: bookingId,
          request_text: extraRequest,
        });
      }

      setMessage("Booking successful! Extra request saved.");
      setAppliedPromo(null);
      setPromoCode("");
      setPromoFeedback("");
      setExtraRequest("");
    } catch (err) {
      console.error("AXIOS ERROR:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Booking failed. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "You must be logged in to book a room. Please log in and try again.";
        // Clear invalid tokens
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!room) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Single Image */}
      <div className="relative w-full h-[70vh]">
        {room.images && room.images.length > 0 ? (
          <>
            <img
              src={`http://localhost:5000${room.images[currentImage]}`}
              alt={room.room_name}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Buttons */}
            {room.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-8 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-8 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-all rotate-180"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <div className="text-center">
              <Home className="w-20 h-20 text-white mx-auto mb-4" />
              <p className="text-white text-xl font-medium">No Images Available</p>
            </div>
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hotel
        </button>
      </div>

      {/* Content Section - Horizontal Layout */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Room Info */}
          <div className="space-y-8">
            {/* Room Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{room.room_name}</h1>
                  <p className="text-lg text-gray-600">{room.hotel_name || "Hotel"}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-xl border border-orange-200">
                  <Users className="w-6 h-6 text-orange-600" />
                  <span className="text-gray-900 font-semibold text-lg">{room.capacity} Guests</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-xl border border-orange-200">
                  <Tag className="w-6 h-6 text-orange-600" />
                  <span className="text-gray-900 font-semibold text-lg">Room {room.room_number}</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg">${room.price}/night</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">About This Room</h2>
                  <p className="text-gray-600">Comfort and elegance combined</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{room.description}</p>
            </div>
          </div>

          {/* Right Side - Booking */}
          <div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-orange-100 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Book This Room</h2>
                  <p className="text-gray-600">Select your dates</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Check-in</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Check-out</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Extra Requests (optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                    rows="3"
                    placeholder="e.g. Late checkout, extra pillows"
                    value={extraRequest}
                    onChange={(e) => setExtraRequest(e.target.value)}
                  />
                </div>

                {/* Promo Code */}
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 font-semibold whitespace-nowrap"
                    >
                      {applyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoFeedback && (
                    <p className="text-sm text-gray-600 mt-2">{promoFeedback}</p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>{nights || 0} night{nights === 1 ? "" : "s"} × ${nightlyRate.toFixed(2)}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 font-medium mb-2">
                      <span>Promo ({appliedPromo.code})</span>
                      <span>- ${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t border-orange-200">
                    <span>Total</span>
                    <span>${totalDue.toFixed(2)}</span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={loading || !room}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 font-bold text-lg shadow-lg"
                >
                  {loading ? "Booking..." : "Book Now"}
                </button>

                {message && (
                  <div className={`p-4 rounded-lg text-sm ${message.includes("successful") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
