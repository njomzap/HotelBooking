const express = require("express");
const router = express.Router(); // ✅ THIS WAS MISSING

const bookingsController = require("../controllers/bookingsController");
const { authMiddleware } = require("../middlewares/auth");

// Create booking
router.post("/", authMiddleware, bookingsController.createBooking);

// Get all bookings (admin / employee)
router.get("/", authMiddleware, bookingsController.getAllBookings);

// Get logged-in user's bookings
router.get("/user/me", authMiddleware, bookingsController.getMyBookings);

// Get bookings by room
router.get("/room/:roomId", authMiddleware, bookingsController.getBookingsByRoom);

// Get booking by ID
router.get("/:id", authMiddleware, bookingsController.getBookingById);

// User edits booking dates
router.put("/user/:id", authMiddleware, bookingsController.updateBookingDatesByUser);

// 🔥 HARD DELETE (admin)
router.delete("/:id/hard", authMiddleware, bookingsController.hardDeleteBooking);

// Soft delete (user cancel)
router.delete("/:id", authMiddleware, bookingsController.deleteBooking);

// Employee confirm
router.put("/confirm/:id", authMiddleware, bookingsController.confirmBookingByEmployee);

// Admin / employee update status
router.put("/:bookingId", authMiddleware, bookingsController.updateBookingStatus);

module.exports = router;
