const fs = require("fs");
const path = require("path");
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
    room.images = images.map((img) => img.image_url);

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { hotel_id, room_name, room_number, description, price, capacity } = req.body;

    // Convert numeric fields
    const hotelIdNum = Number(hotel_id);
    const priceNum = Number(price);
    const capacityNum = Number(capacity);

    const [result] = await pool.query(
      "INSERT INTO rooms (hotel_id, room_name, room_number, description, price, capacity) VALUES (?, ?, ?, ?, ?, ?)",
      [hotelIdNum, room_name, room_number, description, priceNum, capacityNum]
    );

    const roomId = result.insertId;

    // Save uploaded images
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map((file) => [roomId, `/uploads/${file.filename}`]);
      await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ?", [imageValues]);
    }

    res.status(201).json({ message: "Room created successfully", roomId });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a room
const updateRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const { hotel_id, room_name, room_number, description, price, capacity } = req.body;

    // Convert numeric fields
    const hotelIdNum = Number(hotel_id);
    const priceNum = Number(price);
    const capacityNum = Number(capacity);

    const [result] = await pool.query(
      "UPDATE rooms SET hotel_id = ?, room_name = ?, room_number = ?, description = ?, price = ?, capacity = ? WHERE id = ?",
      [hotelIdNum, room_name, room_number, description, priceNum, capacityNum, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Handle image uploads
    if (req.files) {
      // Delete old images
      await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);
      if (req.files.length > 0) {
        const imageValues = req.files.map((file) => [id, `/uploads/${file.filename}`]);
        await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ?", [imageValues]);
      }
    }

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
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

    // Optionally delete images from server filesystem (optional)
    const [images] = await pool.query("SELECT image_url FROM room_images WHERE room_id = ?", [id]);
    images.forEach((img) => {
      const filePath = path.join(__dirname, "..", img.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);
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
