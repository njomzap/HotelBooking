const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelsController');

router.get('/', hotelController.getHotels);


router.get('/:id', hotelController.getHotelById);


router.post('/', hotelController.createHotel);

router.put('/:id', hotelController.updateHotel);

router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
