const pool = require('../db'); 

// GET all hotels
const getAllHotels = async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT * FROM hotels');
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET hotel by ID
const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const [hotel] = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (hotel.length === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel[0]);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// CREATE new hotel
const createHotel = async (req, res) => {
  const { name, address, city } = req.body;
  try {
    await pool.query('INSERT INTO hotels (name, address, city) VALUES (?, ?, ?)', [name, address, city]);
    res.status(201).json({ message: 'Hotel created successfully' });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE hotel
const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, address, city } = req.body;
  try {
    const [result] = await pool.query('UPDATE hotels SET name = ?, address = ?, city = ? WHERE id = ?', [name, address, city, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json({ message: 'Hotel updated successfully' });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE hotel
const deleteHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM hotels WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
