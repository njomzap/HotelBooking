const db = require("../db");
const normalizePromoRow = (row) => ({
  id: row.id,
  code: row.code,
  discount_type: row.discount_type,
  discount_value: Number(row.discount_value),
  start_date: row.start_date,
  end_date: row.end_date,
  usage_limit: row.usage_limit,
  usage_count: row.usage_count,
  active: Boolean(row.active),
});

const computePromoDiscount = (promo, subtotal) => {
  if (!subtotal || subtotal <= 0) return 0;
  if (promo.discount_type === "percentage") {
    return Number(((promo.discount_value / 100) * subtotal).toFixed(2));
  }
  return Math.min(subtotal, Number(promo.discount_value));
};

const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    return value.split("T")[0];
  }
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch (err) {
    return null;
  }
};

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

const fetchBookingWithHotel = async (bookingId) => {
  const [rows] = await db.query(
    `SELECT b.*, r.hotel_id
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     WHERE b.id = ?`,
    [bookingId]
  );
  return rows;
};

const evaluatePromoCode = async (code, subtotal, roomHotelId) => {
  const [rows] = await db.query("SELECT * FROM promo_codes WHERE code = ?", [code.trim()]);
  if (!rows.length) {
    throw new Error("Promo code not found");
  }

  const promo = normalizePromoRow(rows[0]);

  if (promo.hotel_id && promo.hotel_id !== roomHotelId) {
    throw new Error("Promo code applies to a different hotel");
  }
  const todayStr = new Date().toISOString().split("T")[0];
  const promoStart = toDateString(promo.start_date);
  const promoEnd = toDateString(promo.end_date);

  if (!promoStart || !promoEnd) {
    throw new Error("Promo code has invalid activation dates");
  }

  if (todayStr < promoStart || todayStr > promoEnd) {
    throw new Error("Promo code is not active");
  }

  if (!promo.active) {
    throw new Error("Promo code is disabled");
  }

  if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
    throw new Error("Promo code usage limit reached");
  }

  const discount_amount = computePromoDiscount(promo, subtotal);
  return {
    promoId: promo.id,
    discount_amount,
  };
};

exports.getAllBookings = async (req, res) => {
  try {
    let query = `
      SELECT 
        b.*,
        u.name AS user_name,
        u.email AS user_email,
        r.room_name,
        r.hotel_id,
        h.name AS hotel_name,
        p.status AS payment_status,
        p.amount AS payment_amount,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', er.id,
              'request_text', er.request_text
            )
          )
          FROM extra_requests er 
          WHERE er.booking_id = b.id
        ) as extra_requests
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN payments p ON p.booking_id = b.id
    `;

    const params = [];

    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (employeeHotelId) {
      query += " WHERE r.hotel_id = ?";
      params.push(employeeHotelId);
    }

    query += " ORDER BY b.check_in DESC";

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await fetchBookingWithHotel(id);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = rows[0];

    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (employeeHotelId && employeeHotelId !== booking.hotel_id) {
      return res.status(403).json({ message: "You can only view bookings for your assigned hotel" });
    }

    res.json(booking);
  } catch (err) {
    console.error("GET BOOKING BY ID ERROR:", err);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { room_id, check_in, check_out, promo_code } = req.body;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({
        message: "Missing required fields: room_id, check_in, check_out"
      });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date"
      });
    }

    const [rooms] = await db.query(
      "SELECT * FROM rooms WHERE id = ?",
      [room_id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room = rooms[0];

    const [existing] = await db.query(
      `SELECT * FROM bookings
       WHERE room_id = ?
         AND status IN ('pending_payment', 'confirmed')
         AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, checkInDate, checkOutDate]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Room is already booked for the selected dates"
      });
    }

    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const subtotal = room.price * nights;

    let discountAmount = 0;
    let appliedPromoId = null;

    if (promo_code) {
      try {
        const promoResult = await evaluatePromoCode(promo_code, subtotal, room.hotel_id);
        discountAmount = promoResult.discount_amount;
        appliedPromoId = promoResult.promoId;
      } catch (promoErr) {
        return res.status(400).json({ message: promoErr.message });
      }
    }

    const totalPrice = Math.max(subtotal - discountAmount, 0);

    const [result] = await db.query(
      `INSERT INTO bookings
       (user_id, room_id, check_in, check_out, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'pending_payment')`,
      [userId, room_id, checkInDate, checkOutDate, totalPrice]
    );

    if (appliedPromoId) {
      await db.query(
        "UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?",
        [appliedPromoId]
      );
    }

    res.status(201).json({
      booking_id: result.insertId,
      total_price: totalPrice,
      discount_amount: discountAmount,
      promo_code: appliedPromoId ? promo_code : null,
      status: "pending_payment",
      message: "Booking created. Awaiting payment."
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};


exports.updateBookingDatesByUser = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const { check_in, check_out } = req.body;

    if (!check_in || !check_out) {
      return res.status(400).json({ message: "Missing dates" });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    if (booking.status !== "pending_payment") {
      return res.status(400).json({
        message: "Only pending bookings can be edited"
      });
    }

    const [conflicts] = await db.query(
      `SELECT * FROM bookings
       WHERE room_id = ?
         AND id != ?
         AND status IN ('pending_payment', 'confirmed')
         AND NOT (check_out <= ? OR check_in >= ?)`,
      [booking.room_id, bookingId, checkInDate, checkOutDate]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Room is already booked for these dates"
      });
    }

    const oldNights = Math.ceil(
      (new Date(booking.check_out) - new Date(booking.check_in)) /
        (1000 * 60 * 60 * 24)
    );

    const newNights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    const pricePerNight = booking.total_price / oldNights;
    const newTotal = pricePerNight * newNights;

    await db.query(
      `UPDATE bookings
       SET check_in = ?, check_out = ?, total_price = ?
       WHERE id = ?`,
      [checkInDate, checkOutDate, newTotal, bookingId]
    );

    res.json({
      message: "Booking updated successfully",
      total_price: newTotal
    });
  } catch (err) {
    console.error("EDIT BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to edit booking" });
  }
};


exports.getMyBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT 
        b.id, b.room_id, r.room_name,
        b.total_price, h.name AS hotel_name,
        b.check_in, b.check_out, b.status,
        p.status AS payment_status,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', er.id,
              'request_text', er.request_text
            )
          )
          FROM extra_requests er 
          WHERE er.booking_id = b.id
        ) as extra_requests
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.check_in DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET MY BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.getBookingsByRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (employeeHotelId) {
      const [roomRows] = await db.query(
        "SELECT hotel_id FROM rooms WHERE id = ?",
        [roomId]
      );

      if (roomRows.length === 0) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (roomRows[0].hotel_id !== employeeHotelId) {
        return res.status(403).json({ message: "You can only view bookings for your assigned hotel" });
      }
    }

    const [rows] = await db.query(
      `SELECT b.*, u.name AS user_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.room_id = ?
       ORDER BY b.check_in DESC`,
      [roomId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET BOOKINGS BY ROOM ERROR:", err);
    res.status(500).json({ message: "Failed to fetch room bookings" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id; 

    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found or not yours" });
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

exports.hardDeleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Always attempt cleanup first (safe even if nothing exists)
    await db.query("DELETE FROM extra_requests WHERE booking_id = ?", [bookingId]);
    await db.query("DELETE FROM payments WHERE booking_id = ?", [bookingId]);

    // Delete booking itself
    const [result] = await db.query(
      "DELETE FROM bookings WHERE id = ?",
      [bookingId]
    );

    // Idempotent response (no false 404s)
    if (result.affectedRows === 0) {
      return res.json({
        message: "Booking already deleted"
      });
    }

    res.json({
      message: "Booking deleted permanently"
    });
  } catch (err) {
    console.error("HARD DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
};



exports.confirmBookingByEmployee = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        error: "Only employees can confirm bookings"
      });
    }

    const bookingId = req.params.id;

    const rows = await fetchBookingWithHotel(bookingId);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (!employeeHotelId) {
      return res.status(403).json({ message: "Employee is not assigned to a hotel" });
    }

    if (rows[0].hotel_id !== employeeHotelId) {
      return res.status(403).json({ message: "You can only confirm bookings for your assigned hotel" });
    }

    await db.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
      [bookingId]
    );

    res.json({ message: "Booking confirmed" });
  } catch (err) {
    console.error("CONFIRM BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to confirm booking" });
  }
};

// Update only booking status
exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const allowedRoles = ["admin", "employee"];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const rows = await fetchBookingWithHotel(bookingId);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId) {
        return res.status(403).json({ message: "Employee is not assigned to a hotel" });
      }
      if (rows[0].hotel_id !== employeeHotelId) {
        return res.status(403).json({ message: "You can only update bookings for your assigned hotel" });
      }
    }

    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking status updated", status });
  } catch (err) {
    console.error("UPDATE BOOKING STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};




