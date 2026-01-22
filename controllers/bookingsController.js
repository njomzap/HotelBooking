const db = require('../db');

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.*,
        u.name AS user_name,
        r.room_name,
        p.status AS payment_status,
        p.amount AS payment_amount
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN payments p ON p.booking_id = b.id
      ORDER BY b.check_in DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('GET BOOKINGS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET BOOKING BY ID ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { room_id, check_in, check_out } = req.body;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({ message: 'Missing required fields: room_id, check_in, check_out' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check if room exists
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const room = rooms[0];

    // Prevent overlapping bookings for the same room
    const [existing] = await db.query(
      `SELECT * FROM bookings
       WHERE room_id = ?
         AND status IN ('pending_payment', 'confirmed')
         AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, checkInDate, checkOutDate]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Room is already booked for the selected dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Insert booking with correct status
    const [result] = await db.query(
      `INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'pending_payment')`,
      [userId, room_id, checkInDate, checkOutDate, totalPrice]
    );

    res.status(201).json({
      booking_id: result.insertId,
      total_price: totalPrice,
      status: 'pending_payment',
      message: 'Booking created. Awaiting payment.'
    });
  } catch (err) {
    console.error('BOOKING ERROR:', err);
    res.status(500).json({ message: 'Booking failed' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const [updated] = await db.query(
      `SELECT b.*, u.name AS user_name, r.room_name 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [bookingId]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to update booking" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [result] = await db.query(
      "DELETE FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
};

exports.getBookingsByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.room_id, r.room_name, r.price AS payment_amount, b.total_price,
              h.name AS hotel_name, b.check_in, b.check_out, b.status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       WHERE b.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.getBookingsByRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT b.*, u.name AS user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE b.room_id = ? ORDER BY b.check_in DESC',
      [roomId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET BOOKINGS BY ROOM ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch room bookings' });
  }
};

exports.confirmBookingByEmployee = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ error: "Only employees can confirm bookings" });
    }

    const bookingId = req.params.id;

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
