const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController.js');
const upload = require("../middlewares/uploads");

// GET routes
router.get('/', roomsController.getAllRooms);
router.get('/:id', roomsController.getRoomById);

// POST & PUT routes with multer
router.post("/", upload.array("images"), roomsController.createRoom);
router.put("/:id", upload.array("images"), roomsController.updateRoom);

// DELETE route
router.delete("/:id", roomsController.deleteRoom);

module.exports = router;
