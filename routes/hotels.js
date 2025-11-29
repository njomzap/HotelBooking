const express = require('express');
const router = express.Router();
const hotelsController = require('../controllers/hotelsController');

console.log('hotelsController:', hotelsController);

router.get("/", hotelsController.getAllHotels);
router.get("/:id", hotelsController.getHotelById);
router.post("/", hotelsController.createHotel);
router.put("/:id", hotelsController.updateHotel);
router.delete("/:id",hotelsController.deleteHotel);

console.log("Hotels route loaded");

module.exports = router;