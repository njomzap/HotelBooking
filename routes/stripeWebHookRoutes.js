const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/stripeWebHookController");

// Stripe requires raw body for signature verification
router.post(
  "/",
  express.raw({ type: "application/json" }),
  webhookController.handleWebhook
);

module.exports = router;
