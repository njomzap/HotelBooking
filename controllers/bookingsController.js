const db = require('../db'); 

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.*,
        u.name AS user_name,
        r.room_name AS room_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
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

    const [result] = await db.query(
      `INSERT INTO bookings (user_id, room_id, check_in, check_out, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, room_id, check_in, check_out]
    );

    res.status(201).json({
      booking_id: result.insertId,
      status: "pending",
      message: "Booking created. Awaiting payment."
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Booking failed" });
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
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT b.*, r.room_name FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id WHERE b.user_id = ? ORDER BY b.check_in DESC',
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET BOOKINGS BY USER ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch user bookings' });
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
