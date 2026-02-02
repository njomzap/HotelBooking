import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar, Users, Home, DollarSign, Tag, MapPin, X, User, Lock } from "lucide-react";
import { authService } from "../services/authService";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check auth state on mount and listen for changes
  useEffect(() => {
    // Initial check
    const checkAuth = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    // Check immediately
    checkAuth();

    // Listen for auth change events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [modalCheckIn, setModalCheckIn] = useState("");
  const [modalCheckOut, setModalCheckOut] = useState("");
  const [modalExtraRequest, setModalExtraRequest] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

    const token = authService.getToken();
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

    const token = authService.getToken();
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
        authService.logout();
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

  // Modal booking handler
  const handleModalBooking = async () => {
    if (!room || !room.id) {
      setModalMessage("Room information is still loading. Please wait.");
      return;
    }

    if (!modalCheckIn || !modalCheckOut) {
      setModalMessage("Please select check-in and check-out dates");
      return;
    }

    setModalLoading(true);
    setModalMessage("");

    try {
      const token = authService.getToken();
      if (!token) {
        setModalMessage("You must be logged in to book a room.");
        authService.logout();
        return;
      }

      const payload = {
        room_id: room.id,
        check_in: modalCheckIn,
        check_out: modalCheckOut,
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

      if (modalExtraRequest.trim()) {
        await axios.post(EXTRA_REQUESTS_API, {
          booking_id: bookingId,
          request_text: modalExtraRequest,
        });
      }

      setModalMessage("Booking successful! Your room has been reserved.");
      setTimeout(() => {
        setShowBookingModal(false);
        setModalCheckIn("");
        setModalCheckOut("");
        setModalExtraRequest("");
        setModalMessage("");
        setAppliedPromo(null);
        setPromoCode("");
        setPromoFeedback("");
      }, 2000);
    } catch (err) {
      console.error("MODAL BOOKING ERROR:", err);
      
      let errorMessage = "Booking failed. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "You must be logged in to book a room.";
        authService.logout();
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setModalMessage(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

const applyPromoCode = async () => {
  if (!promoCode.trim()) {
    setPromoFeedback("Please enter a promo code");
    return;
  }

  setApplyingPromo(true);
  setPromoFeedback("");

  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    
    const response = await axios.post(`${API_URL}/${room.id}/evaluate-promo`, {
      promo_code: promoCode.trim(),
      room_id: room.id,
      subtotal: room.price * (modalCheckIn && modalCheckOut ? Math.ceil((new Date(modalCheckOut) - new Date(modalCheckIn)) / (1000 * 60 * 60 * 24)) : 1)
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const promo = response.data;
    setAppliedPromo(promo);
    setPromoFeedback(`Promo code applied! You saved ${promo.discount}%`);
  } catch (error) {
    console.error("Promo error:", error);
    setPromoFeedback(error.response?.data?.message || "Invalid promo code");
    setAppliedPromo(null);
  } finally {
    setApplyingPromo(false);
  }
};

const openBookingModal = () => {
  if (!authService.isLoggedIn()) {
    // Don't open modal for unauthenticated users
    // The login/register buttons in the booking section will handle this
    return;
  }
  // Show booking form for authenticated users only
  setShowBookingModal(true);
};

if (!room) return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
  </div>
);

return (
  <div className="min-h-screen bg-orange-50">
    {/* Hero Section */}
    <div className="relative w-full h-96">
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
                className="absolute top-1/2 left-6 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full p-2 hover:bg-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-6 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full p-2 hover:bg-white transition-all rotate-180"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <div className="text-center">
            <Home className="w-16 h-16 text-white mx-auto mb-4" />
            <p className="text-white text-lg font-medium">No Images Available</p>
          </div>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Room Information */}
          <div className="lg:col-span-2">
            {/* Room Title Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.room_name}</h1>
                  <p className="text-lg text-gray-600">{room.hotel_name || "Hotel"}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">${room.price}</div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-900 font-medium">{room.capacity} Guests</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  <Home className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-900 font-medium">Room {room.room_number}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Room</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{room.description}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Section */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Book Your Stay</h3>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 text-sm">Best price guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 text-sm">Instant confirmation</span>
                </div>
              </div>

              {/* CTA Button */}
              {!isLoggedIn ? (
                // Not logged in - show login/register options
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium text-center mb-3">
                      You need to be logged in to book this room
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        authService.logout();
                        navigate('/login');
                      }}
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </button>
                    <button
                      onClick={() => {
                        authService.logout();
                        navigate('/register');
                      }}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Register
                    </button>
                  </div>
                </div>
              ) : (
                // Logged in - show Book Now button
                <button
                  type="button"
                  onClick={openBookingModal}
                  disabled={!room}
                  className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Book Your Room</h2>
                    <p className="text-gray-600">{room?.room_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!authService.isLoggedIn() ? (
                /* Not Logged In */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You need to be logged in to book a room. Create an account or login to continue with your booking.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        authService.logout();
                        navigate('/login');
                      }}
                      className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Login
                    </button>
                    <button
                      onClick={() => {
                        authService.logout();
                        navigate('/register');
                      }}
                      className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Register
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Check-in</label>
                      <input
                        type="date"
                        value={modalCheckIn}
                        onChange={(e) => setModalCheckIn(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Check-out</label>
                      <input
                        type="date"
                        value={modalCheckOut}
                        onChange={(e) => setModalCheckOut(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min={modalCheckIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Extra Requests (Optional)</label>
                    <textarea
                      value={modalExtraRequest}
                      onChange={(e) => setModalExtraRequest(e.target.value)}
                      placeholder="Any special requests for your stay..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Promo Code Section */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={applyingPromo || !promoCode.trim()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                      >
                        {applyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {promoFeedback && (
                      <p className={`mt-2 text-sm ${promoFeedback.includes('applied') ? 'text-green-600' : 'text-red-600'}`}>
                        {promoFeedback}
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Price</span>
                        <span className="font-medium">${room?.price || 0} x {modalCheckIn && modalCheckOut ? Math.ceil((new Date(modalCheckOut) - new Date(modalCheckIn)) / (1000 * 60 * 60 * 24)) : 0} nights</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedPromo.discount}%)</span>
                          <span>-${(appliedPromo.discountAmount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-orange-600">${(room?.price || 0) * (modalCheckIn && modalCheckOut ? Math.ceil((new Date(modalCheckOut) - new Date(modalCheckIn)) / (1000 * 60 * 60 * 24)) : 0) - (appliedPromo?.discountAmount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Button */}
                  <button
                    onClick={handleModalBooking}
                    disabled={modalLoading || !modalCheckIn || !modalCheckOut}
                    className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 font-semibold shadow-md hover:shadow-lg"
                  >
                    {modalLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>

                  {/* Modal Message */}
                  {modalMessage && (
                    <div className={`p-4 rounded-lg text-center ${
                      modalMessage.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {modalMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default RoomDetail;
