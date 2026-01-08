const db = require('../db'); 


const getHotels = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM hotels');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const createHotel = async (req, res) => {
  const { name, address, city, phone, email, country, has_pool, has_gym, parking } = req.body;

  try {
    const [result] = await db
      .promise()
      .query(
        `INSERT INTO hotels 
        (name, address, city, phone, email, country, has_pool, has_gym, parking) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, address, city, phone, email, country, has_pool, has_gym, parking]
      );

    const [newHotel] = await db
      .promise()
      .query('SELECT * FROM hotels WHERE id = ?', [result.insertId]);

    res.status(201).json(newHotel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, address, city, phone, email, country, has_pool, has_gym, parking } = req.body;

  try {
    const [result] = await db
      .promise()
      .query(
        `UPDATE hotels SET
          name = ?, address = ?, city = ?, phone = ?, email = ?, country = ?, 
          has_pool = ?, has_gym = ?, parking = ?
         WHERE id = ?`,
        [name, address, city, phone, email, country, has_pool, has_gym, parking, id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const [updatedHotel] = await db
      .promise()
      .query('SELECT * FROM hotels WHERE id = ?', [id]);

    res.json(updatedHotel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


const deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db
      .promise()
      .query('DELETE FROM hotels WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
