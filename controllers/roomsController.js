const fs = require("fs");
const path = require("path");
const pool = require("../db");


const getAllRooms = async (req, res) => {
  try {
    const [rooms] = await pool.query("SELECT * FROM rooms");

    for (let room of rooms) {
      const [images] = await pool.query(
        "SELECT image_url FROM room_images WHERE room_id = ?",
        [room.id]
      );
      room.images = images.map(img => img.image_url);
    }

    console.log("Rooms fetched:", rooms); // 👈 Add this
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Server error" });
  }
};




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


const createRoom = async (req, res) => {
  try {
    const { hotel_id, room_name, room_number, description, price, capacity } = req.body;

    const hotelIdNum = Number(hotel_id);
    const priceNum = Number(price);
    const capacityNum = Number(capacity);

    const [result] = await pool.query(
      "INSERT INTO rooms (hotel_id, room_name, room_number, description, price, capacity) VALUES (?, ?, ?, ?, ?, ?)",
      [hotelIdNum, room_name, room_number, description, priceNum, capacityNum]
    );

    const roomId = result.insertId;

    
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


const updateRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const { hotel_id, room_name, room_number, description, price, capacity } = req.body;

    
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


    if (req.files && req.files.length > 0) {
      
      const [oldImages] = await pool.query("SELECT image_url FROM room_images WHERE room_id = ?", [id]);
      oldImages.forEach(img => {
        const filePath = path.join(__dirname, "..", img.image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);

      
      const imageValues = req.files.map(file => [id, `/uploads/${file.filename}`]);
      await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ?", [imageValues]);
    }

    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};



const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    
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
