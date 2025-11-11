const express = require('express');  
const cors = require('cors');       
 const pool = require('./db');

const app = express();               

app.use(cors());                     
app.use(express.json());             


app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/hotels', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hotels');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/users', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    res.status(201).json({ userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/hotels/:hotelId/rooms', async (req, res) => {
  const { hotelId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE hotel_id = ?', [hotelId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = app;                
           
