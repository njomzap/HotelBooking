const express = require("express");
const router = express.Router();
const extraRequestsController = require("../controllers/extraRequestsController");


router.post("/", extraRequestsController.createExtraRequest);

router.get("/booking/:bookingId", extraRequestsController.getRequestsByBooking);

router.put("/:id", extraRequestsController.updateExtraRequest);

router.delete("/:id", extraRequestsController.deleteExtraRequest);

module.exports = router;
