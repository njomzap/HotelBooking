const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");
const { authMiddleware } = require("../middlewares/auth");

// Create Stripe checkout session
router.post("/create-checkout-session", authMiddleware, paymentsController.createCheckoutSession);

// Get all payments (for employee panel)
router.get("/all", authMiddleware, paymentsController.getAllPayments);

// Update payment status
router.put("/:id/status", authMiddleware, paymentsController.updatePaymentStatus);

// Delete payment
router.delete("/:id", authMiddleware, paymentsController.deletePayment);


module.exports = router;
