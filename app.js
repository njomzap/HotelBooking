const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));


const stripeWebhookRoutes = require("./routes/stripeWebHookRoutes");
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" })
);
app.use("/api/webhooks", stripeWebhookRoutes);

// JSON for all other routes
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use("/api/extra-requests", require('./routes/extraRequests'));
app.use('/api/lostfound', require('./routes/lostFound'));
app.use('/api/reviews', require('./routes/reviews'));
app.use("/api/payments", require("./routes/payments"));

app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;
