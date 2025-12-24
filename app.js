const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());


//const userRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');
const hotelsRoutes = require('./routes/hotels');


//app.use('/api/users', userRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/hotels', hotelsRoutes);


app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;
