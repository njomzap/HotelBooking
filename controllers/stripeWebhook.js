const Stripe = require("stripe");
const db = require("../db"); 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  let event;

  try {
    
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  
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

      console.log(`✅ Payment confirmed for booking ${bookingId}`);
    } catch (err) {
      console.error("Error updating payment/booking:", err);
    }
  }

  
  res.json({ received: true });
};
