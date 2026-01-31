const express = require("express");
const router = express.Router();

const bookingsController = require("../controllers/bookingsController");
const { authMiddleware } = require("../middlewares/auth");



router.post("/", authMiddleware, bookingsController.createBooking);

router.get("/", authMiddleware, bookingsController.getAllBookings);

router.get("/user/me", authMiddleware, bookingsController.getMyBookings);

router.get("/room/:roomId", authMiddleware, bookingsController.getBookingsByRoom);

router.get("/:id", authMiddleware, bookingsController.getBookingById);

router.put("/user/:id", authMiddleware, bookingsController.updateBookingDatesByUser);



router.delete("/:id", authMiddleware, bookingsController.deleteBooking);

router.delete("/:id/hard", authMiddleware, bookingsController.hardDeleteBooking);

router.put("/confirm/:id", authMiddleware, bookingsController.confirmBookingByEmployee);

router.put("/:bookingId", authMiddleware, bookingsController.updateBookingStatus);

module.exports = router;
