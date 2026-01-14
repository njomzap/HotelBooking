const fs = require("fs");
const path = require("path");
const pool = require("../db");

const getHotels = async (req, res) => {
  try {
    const [hotels] = await pool.query("SELECT * FROM hotels");
    for (let hotel of hotels) {
      const [images] = await pool.query(
        "SELECT image_url FROM hotel_images WHERE hotel_id = ?",
        [hotel.id]
      );
      hotel.images = images.map(img => img.image_url);
    }
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM hotels WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Hotel not found" });
    const hotel = rows[0];
    const [images] = await pool.query("SELECT image_url FROM hotel_images WHERE hotel_id = ?", [id]);
    hotel.images = images.map(img => img.image_url);
    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const createHotel = async (req, res) => {
  try {
    const { name, address, city, phone, email, country, has_pool, has_gym, parking } = req.body;
    const poolVal = has_pool === "true" || has_pool === true ? 1 : 0;
    const gymVal = has_gym === "true" || has_gym === true ? 1 : 0;
    const parkingVal = parking === "true" || parking === true ? 1 : 0;
    const [result] = await pool.query(
      `INSERT INTO hotels (name, address, city, phone, email, country, has_pool, has_gym, parking)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, phone, email, country, poolVal, gymVal, parkingVal]
    );
    const hotelId = result.insertId;
    if (req.files && req.files.length > 0) {
      const placeholders = req.files.map(() => "(?, ?)").join(", ");
      const values = req.files.flatMap(file => [hotelId, `/uploads/${file.filename}`]);
      await pool.query(`INSERT INTO hotel_images (hotel_id, image_url) VALUES ${placeholders}`, values);
    }
    res.status(201).json({ message: "Hotel created", hotelId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, address, city, phone, email, country, has_pool, has_gym, parking } = req.body;
    const poolVal = has_pool === "true" || has_pool === true ? 1 : 0;
    const gymVal = has_gym === "true" || has_gym === true ? 1 : 0;
    const parkingVal = parking === "true" || parking === true ? 1 : 0;
    const [result] = await pool.query(
      `UPDATE hotels SET name = ?, address = ?, city = ?, phone = ?, email = ?, country = ?, has_pool = ?, has_gym = ?, parking = ? WHERE id = ?`,
      [name, address, city, phone, email, country, poolVal, gymVal, parkingVal, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hotel not found" });
    if (req.files && req.files.length > 0) {
      const [oldImages] = await pool.query("SELECT image_url FROM hotel_images WHERE hotel_id = ?", [id]);
      oldImages.forEach(img => {
        const filePath = path.join(__dirname, "..", img.image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      await pool.query("DELETE FROM hotel_images WHERE hotel_id = ?", [id]);
      const placeholders = req.files.map(() => "(?, ?)").join(", ");
      const values = req.files.flatMap(file => [id, `/uploads/${file.filename}`]);
      await pool.query(`INSERT INTO hotel_images (hotel_id, image_url) VALUES ${placeholders}`, values);
    }
    res.json({ message: "Hotel updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const [images] = await pool.query("SELECT image_url FROM hotel_images WHERE hotel_id = ?", [id]);
    images.forEach(img => {
      const filePath = path.join(__dirname, "..", img.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    await pool.query("DELETE FROM hotel_images WHERE hotel_id = ?", [id]);
    const [result] = await pool.query("DELETE FROM hotels WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hotel not found" });
    res.json({ message: "Hotel deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getHotels, getHotelById, createHotel, updateHotel, deleteHotel };
