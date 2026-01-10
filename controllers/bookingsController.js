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
  const { user_id, room_id, check_in, check_out } = req.body;

  if (!user_id || !room_id || !check_in || !check_out) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    const [[room]] = await db.query('SELECT id FROM rooms WHERE id = ?', [room_id]);
    if (!room) return res.status(400).json({ message: 'Room does not exist' });

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, room_id, check_in, check_out) VALUES (?, ?, ?, ?)',
      [user_id, room_id, check_in, check_out]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId
    });

  } catch (err) {
    console.error('CREATE BOOKING ERROR:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { check_in, check_out } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE bookings SET check_in = ?, check_out = ? WHERE id = ?',
      [check_in, check_out, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    console.error('UPDATE BOOKING ERROR:', err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('DELETE BOOKING ERROR:', err);
    res.status(500).json({ message: 'Failed to delete booking' });
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
