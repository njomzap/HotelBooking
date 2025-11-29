const pool = require("../db");

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const [rooms] = await pool.query("SELECT * FROM rooms");
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const [roomRows] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);

    if (roomRows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const room = roomRows[0];

    
    const [images] = await pool.query("SELECT image_url FROM room_images WHERE room_id = ?", [id]);
    room.images = images.map(img => img.image_url);

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new room
const createRoom = async (req, res) => {
  const { hotel_id, room_name, room_number, description, price, capacity, images } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO rooms (hotel_id, room_name, room_number, description, price, capacity) VALUES (?, ?, ?, ?, ?, ?)",
      [hotel_id, room_name, room_number, description, price, capacity]
    );

    const roomId = result.insertId;

    if (images && images.length > 0) {
      const imageValues = images.map(url => [roomId, url]);
      await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ?", [imageValues]);
    }

    res.status(201).json({ message: "Room created successfully", roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a room
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { hotel_id, room_name, room_number, description, price, capacity, images } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE rooms SET hotel_id = ?, room_name = ?, room_number = ?, description = ?, price = ?, capacity = ? WHERE id = ?",
      [hotel_id, room_name, room_number, description, price, capacity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (images) {
      await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);
      if (images.length > 0) {
        const imageValues = images.map(url => [id, url]);
        await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ?", [imageValues]);
      }
    }

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
