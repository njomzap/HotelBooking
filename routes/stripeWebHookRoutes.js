const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/stripeWebHookController");


router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleWebhook
);

module.exports = router;
