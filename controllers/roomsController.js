const fs = require("fs");
const path = require("path");
const pool = require("../db");


const resolveEmployeeHotelId = async (req) => {
  if (!req?.user || req.user.role !== "employee") {
    return null;
  }

  if (req.user.hotelId) {
    return req.user.hotelId;
  }

  const [rows] = await pool.query("SELECT hotel_id FROM users WHERE id = ?", [req.user.id]);
  return rows.length ? rows[0].hotel_id : null;
};

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

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getRoomsByHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (employeeHotelId && employeeHotelId.toString() !== hotelId) {
      return res.status(403).json({ error: "You can only view rooms for your assigned hotel" });
    }

    const [rooms] = await pool.query(
      "SELECT * FROM rooms WHERE hotel_id = ?",
      [hotelId]
    );

    for (let room of rooms) {
      const [images] = await pool.query(
        "SELECT image_url FROM room_images WHERE room_id = ?",
        [room.id]
      );
      room.images = images.map(img => img.image_url);
    }

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms by hotel:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const [roomRows] = await pool.query(
      "SELECT * FROM rooms WHERE id = ?",
      [id]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const room = roomRows[0];

    const [images] = await pool.query(
      "SELECT image_url FROM room_images WHERE room_id = ?",
      [id]
    );
    room.images = images.map(img => img.image_url);

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const createRoom = async (req, res) => {
  try {
    const { hotel_id, room_name, room_number, description, price, capacity } =
      req.body;

    const employeeHotelId = await resolveEmployeeHotelId(req);
    const isEmployee = req.user?.role === "employee";
    const effectiveHotelId = isEmployee ? employeeHotelId : hotel_id;

    if (!effectiveHotelId) {
      return res.status(400).json({ error: "hotel_id is required" });
    }

    if (isEmployee && !employeeHotelId) {
      return res.status(403).json({ error: "Employee is not assigned to a hotel" });
    }

    const [result] = await pool.query(
      `INSERT INTO rooms 
       (hotel_id, room_name, room_number, description, price, capacity) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(effectiveHotelId),
        room_name,
        room_number,
        description,
        Number(price),
        Number(capacity),
      ]
    );

    const roomId = result.insertId;

    if (req.files && req.files.length > 0) {
      const placeholders = req.files.map(() => "(?, ?)").join(", ");
      const values = req.files.flatMap(file => [
        roomId,
        `/uploads/${file.filename}`,
      ]);

      await pool.query(
        `INSERT INTO room_images (room_id, image_url) VALUES ${placeholders}`,
        values
      );
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
    const { hotel_id, room_name, room_number, description, price, capacity } =
      req.body;

    const [existingRoomRows] = await pool.query(
      "SELECT hotel_id FROM rooms WHERE id = ?",
      [id]
    );

    if (existingRoomRows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const existingHotelId = existingRoomRows[0].hotel_id;
    const employeeHotelId = await resolveEmployeeHotelId(req);
    const isEmployee = req.user?.role === "employee";

    if (isEmployee && employeeHotelId !== existingHotelId) {
      return res.status(403).json({ error: "You can only update rooms for your assigned hotel" });
    }

    const effectiveHotelId = isEmployee ? existingHotelId : (hotel_id ?? existingHotelId);

    const [result] = await pool.query(
      `UPDATE rooms 
       SET hotel_id = ?, room_name = ?, room_number = ?, description = ?, price = ?, capacity = ?
       WHERE id = ?`,
      [
        Number(effectiveHotelId),
        room_name,
        room_number,
        description,
        Number(price),
        Number(capacity),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (req.files && req.files.length > 0) {
      const [oldImages] = await pool.query(
        "SELECT image_url FROM room_images WHERE room_id = ?",
        [id]
      );

      oldImages.forEach(img => {
        const filePath = path.join(__dirname, "..", img.image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);

      const placeholders = req.files.map(() => "(?, ?)").join(", ");
      const values = req.files.flatMap(file => [
        id,
        `/uploads/${file.filename}`,
      ]);

      await pool.query(
        `INSERT INTO room_images (room_id, image_url) VALUES ${placeholders}`,
        values
      );
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
    console.log('🗑️ Deleting room with ID:', id);
    
    const [existingRoomRows] = await pool.query(
      "SELECT hotel_id FROM rooms WHERE id = ?",
      [id]
    );

    if (existingRoomRows.length === 0) {
      console.log('❌ Room not found');
      return res.status(404).json({ error: "Room not found" });
    }

    const employeeHotelId = await resolveEmployeeHotelId(req);
    if (employeeHotelId && employeeHotelId !== existingRoomRows[0].hotel_id) {
      console.log('❌ Employee not authorized for this hotel');
      return res.status(403).json({ error: "You can only delete rooms for your assigned hotel" });
    }

    console.log('📸 Fetching images for room:', id);
    const [images] = await pool.query(
      "SELECT image_url FROM room_images WHERE room_id = ?",
      [id]
    );

    console.log('📁 Found images:', images.length);
    
    // Temporarily skip file deletion to test database operations
    console.log('⚠️ Skipping file deletion for debugging');
    
    console.log('🗑️ Deleting room images from database');
    await pool.query("DELETE FROM room_images WHERE room_id = ?", [id]);

    console.log('🗑️ Deleting room from database');
    const [result] = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      console.log('❌ Room not found in database');
      return res.status(404).json({ error: "Room not found" });
    }

    console.log('✅ Room deleted successfully');
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomsByHotel, 
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
