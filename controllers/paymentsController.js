const Stripe = require("stripe");
const db = require("../db");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const resolveEmployeeHotelId = async (req) => {
  if (!req?.user || req.user.role !== "employee") {
    return null;
  }

  if (req.user.hotelId) {
    return Number(req.user.hotelId);
  }

  const [rows] = await db.query("SELECT hotel_id FROM users WHERE id = ?", [req.user.id]);
  return rows.length ? rows[0].hotel_id : null;
};

exports.getAllPayments = async (req, res) => {
  try {
    console.log("Payments request - User:", req.user);
    
    let query = `
      SELECT p.*, b.id as booking_id, b.user_id, b.check_in, b.check_out, 
             u.name as customer_name, u.email as customer_email
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
    `;

    const params = [];

    const employeeHotelId = await resolveEmployeeHotelId(req);
    console.log("Employee hotel ID:", employeeHotelId);
    
    if (employeeHotelId) {
      query += " WHERE r.hotel_id = ?";
      params.push(employeeHotelId);
    }

    query += " ORDER BY p.created_at DESC";

    console.log("Final query:", query);
    console.log("Params:", params);

    const [rows] = await db.query(query, params);
    console.log("Payments found:", rows.length);
    
    res.json(rows);
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Get payment with booking info first
    const [paymentRows] = await db.query(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const payment = paymentRows[0];
    const bookingId = payment.booking_id;

    // Update payment status
    const [result] = await db.query(
      "UPDATE payments SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update corresponding booking status based on payment status
    let bookingStatus;
    switch (status) {
      case 'paid':
        bookingStatus = 'confirmed';
        break;
      case 'pending':
        bookingStatus = 'pending_payment';
        break;
      case 'failed':
      case 'refunded':
        bookingStatus = 'cancelled';
        break;
      default:
        bookingStatus = 'pending_payment';
    }

    await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [bookingStatus, bookingId]
    );

    res.json({ 
      message: "Payment status updated successfully",
      paymentStatus: status,
      bookingStatus: bookingStatus
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get payment with booking info first
    const [paymentRows] = await db.query(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const payment = paymentRows[0];
    const bookingId = payment.booking_id;

    // Delete the payment
    const [result] = await db.query(
      "DELETE FROM payments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update corresponding booking status to pending_payment
    await db.query(
      "UPDATE bookings SET status = 'pending_payment' WHERE id = ?",
      [bookingId]
    );

    res.json({ 
      message: "Payment deleted successfully and booking reset to pending payment",
      bookingStatus: "pending_payment"
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
