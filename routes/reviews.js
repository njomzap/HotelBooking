const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const { authenticate } = require("../middlewares/auth"); 
console.log("reviewsController:", reviewsController);
const { authMiddleware } = require("../middlewares/auth");

router.get("/:hotelId", reviewsController.getReviewsByHotel);

router.post("/", authMiddleware, reviewsController.createReview);

router.put("/:id", authMiddleware, reviewsController.updateReview);

router.delete("/:id", authMiddleware, reviewsController.deleteReview);
module.exports = router;

