const Stripe = require("stripe");
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Webhook endpoint for Stripe events
 * ⚠️ Make sure you use express.raw({ type: "application/json" }) for this route
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error("❌ No booking ID in session metadata");
      return res.status(400).send("Missing booking ID in metadata");
    }

    try {
      // Update payment status
      await db.query(
        "UPDATE payments SET status = 'paid', method = 'stripe' WHERE booking_id = ?",
        [bookingId]
      );

      // Update booking status
      await db.query(
        "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
        [bookingId]
      );

      console.log(`✅ Booking ${bookingId} marked as paid and confirmed`);
    } catch (err) {
      console.error("DB update failed:", err);
    }
  }

  res.json({ received: true });
};
