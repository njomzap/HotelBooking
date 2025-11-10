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

module.exports = app;                
           
