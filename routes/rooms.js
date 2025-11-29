const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController.js');
console.log('roomsController:', roomsController);

router.get('/', roomsController.getAllRooms);
router.get('/:id', roomsController.getRoomById);
router.post('/', roomsController.createRoom);
router.put('/:id', roomsController.updateRoom);
router.delete('/:id', roomsController.deleteRoom);

console.log("Rooms route loaded");


module.exports = router;
