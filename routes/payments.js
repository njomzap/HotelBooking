const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");

// Create Stripe checkout session
router.post("/create-checkout-session", paymentsController.createCheckoutSession);

// ⚠️ Remove webhook from here!
// The webhook route must live in stripeWebHookRoutes.js
// router.post("/webhook", express.raw({ type: "application/json" }), paymentsController.handleWebhook);

module.exports = router;
