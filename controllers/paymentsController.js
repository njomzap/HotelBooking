const Stripe = require("stripe");
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Get booking from DB
    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingId]
    );
    if (!bookings.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    // Check if payment record exists; if not, create one
    const [payments] = await db.query(
      "SELECT * FROM payments WHERE booking_id = ?",
      [bookingId]
    );
    if (!payments.length) {
      await db.query(
        "INSERT INTO payments (booking_id, amount, status) VALUES (?, ?, 'pending')",
        [bookingId, booking.total_price]
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Booking ${booking.id} - Room ${booking.room_id}` },
            unit_amount: Math.round(booking.total_price * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id.toString() },
      success_url: "http://localhost:3000/user/bookings?success=true",
      cancel_url: "http://localhost:3000/user/bookings?canceled=true",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("CREATE CHECKOUT SESSION ERROR:", err);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};
