const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// --- Stripe Webhook ---
// Route uses raw body only for this endpoint
app.use('/api/webhooks/stripe', require('./routes/stripeWebHookRoutes'));

// JSON parsing for all other routes
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/extra-requests', require('./routes/extraRequests'));
app.use('/api/lostfound', require('./routes/lostFound'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;
