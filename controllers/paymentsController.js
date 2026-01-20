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
            unit_amount: booking.price * 100, // euro → cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${booking.id}`,
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
      "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
      [bookingId]
    );

    res.json({ message: "Payment confirmed" });
  } catch (err) {
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};
