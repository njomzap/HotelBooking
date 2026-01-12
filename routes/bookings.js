const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const { authMiddleware } = require("../middlewares/auth");

console.log("Bookings routes loaded");


router.post("/", authMiddleware, bookingsController.createBooking);


router.get("/", authMiddleware, bookingsController.getAllBookings);


router.get("/user/:userId", authMiddleware, bookingsController.getBookingsByUser);


router.get("/room/:roomId", authMiddleware, bookingsController.getBookingsByRoom);


router.get("/:id", authMiddleware, bookingsController.getBookingById);

router.put("/:id", authMiddleware, bookingsController.updateBooking);

router.delete("/:id", authMiddleware, bookingsController.deleteBooking);

module.exports = router;
