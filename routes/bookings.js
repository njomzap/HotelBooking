const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

console.log('Bookings routes loaded');

router.post('/test', (req, res) => {
  res.json({ message: 'Bookings POST works' });
});

router.post('/', bookingsController.createBooking);

router.get('/user/:userId', bookingsController.getBookingsByUser);

router.get('/room/:roomId', bookingsController.getBookingsByRoom);

router.get('/:id', bookingsController.getBookingById);

router.get('/', bookingsController.getAllBookings);


router.put('/:id', bookingsController.updateBooking);


router.delete('/:id', bookingsController.deleteBooking);

module.exports = router;
