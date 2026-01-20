const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentsController");

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.put("/confirm/:bookingId", paymentController.confirmPayment);

module.exports = router;
