const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelsController");
const upload = require("../middlewares/uploads"); // multer

router.get("/", hotelController.getHotels);

router.get("/:id", hotelController.getHotelById);

router.post(
  "/",
  upload.array("images", 5), 
  hotelController.createHotel
);


router.put(
  "/:id",
  upload.array("images", 5),
  hotelController.updateHotel
);


router.delete("/:id", hotelController.deleteHotel);

module.exports = router;
