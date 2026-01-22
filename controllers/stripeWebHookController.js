const Stripe = require("stripe");
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Payment completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    try {
      await db.query(
        "UPDATE payments SET status = 'paid', method = 'stripe' WHERE booking_id = ?",
        [bookingId]
      );

      await db.query(
        "UPDATE bookings SET status = 'completed' WHERE id = ?",
        [bookingId]
      );

      console.log(`✅ Booking ${bookingId} marked as paid`);
    } catch (err) {
      console.error("DB update failed:", err);
    }
  }

  res.json({ received: true });
};
