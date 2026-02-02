const express = require('express');
const router = express.Router(); 
const roomsController = require('../controllers/roomsController.js');
const { applyPromoCode } = require('../controllers/promoCodesController.js');
const upload = require('../middlewares/uploads');

const {
  authMiddleware,
  requireRole,
  requireAnyRole
} = require('../middlewares/auth');


router.get('/', roomsController.getAllRooms);

router.get('/:id', roomsController.getRoomById);

router.post(
  '/:id/evaluate-promo',
  authMiddleware,
  requireAnyRole(['admin', 'employee', 'user']),
  applyPromoCode
);

router.get("/hotel/:hotelId", roomsController.getRoomsByHotel);



router.post(
  '/',
  authMiddleware,
  requireAnyRole(['admin', 'employee']),
  upload.array('images'),
  roomsController.createRoom
);


router.put(
  '/:id',
  authMiddleware,
  requireAnyRole(['admin', 'employee']),
  upload.array('images'),
  roomsController.updateRoom
);


router.delete(
  '/:id',
  authMiddleware,
  requireAnyRole(['admin', 'employee']),
  roomsController.deleteRoom
);

module.exports = router;
