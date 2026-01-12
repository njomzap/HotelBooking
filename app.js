const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));


app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const userRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');
const hotelsRoutes = require('./routes/hotels');
const bookingsRoutes = require('./routes/bookings');
const extraRequestsRoutes = require('./routes/extraRequests');


app.use('/api/users', userRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/bookings/', bookingsRoutes);
app.use("/api/extra-requests", extraRequestsRoutes);


app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;
