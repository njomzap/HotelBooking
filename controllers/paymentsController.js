const Stripe = require("stripe");
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const [bookings] = await db.query(
      "SELECT b.*, r.price FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?",
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    const [existingPayments] = await db.query(
      "SELECT * FROM payments WHERE booking_id = ?",
      [bookingId]
    );

    if (existingPayments.length === 0) {
      await db.query(
        "INSERT INTO payments (booking_id, amount, status, method) VALUES (?, ?, 'pending', NULL)",
        [bookingId, booking.total_price]
      );

      await db.query(
        "UPDATE bookings SET status = 'pending_payment' WHERE id = ?",
        [bookingId]
      );
    }

    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Hotel Booking Payment",
        },
        unit_amount: booking.total_price * 100,
      },
      quantity: 1,
    },
  ],

  metadata: {
    bookingId: booking.id.toString(),
  },

  success_url: `${process.env.FRONTEND_URL}/user/bookings`,
  cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
});

    

    res.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
};


exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    await db.query(
      `UPDATE payments SET status = 'paid', method = 'stripe' WHERE booking_id = ?`,
      [bookingId]
    );

    await db.query(
      `UPDATE bookings SET status = 'completed' WHERE id = ?`,
      [bookingId]
    );

    res.json({ message: "Payment completed. Booking ready for employee confirmation." });
  } catch (err) {
    console.error("PAYMENT CONFIRM ERROR:", err);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};

