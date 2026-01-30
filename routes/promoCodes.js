const express = require("express");
const router = express.Router();

const {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
  getActivePromoCodes,
} = require("../controllers/promoCodesController");

const {
  authMiddleware,
  requireRole,
  requireAnyRole,
} = require("../middlewares/auth");

router.get(
  "/",
  authMiddleware,
  requireAnyRole(["admin", "employee"]),
  getAllPromoCodes
);

router.get(
  "/:id",
  authMiddleware,
  requireAnyRole(["admin", "employee"]),
  getPromoCodeById
);

router.post(
  "/",
  authMiddleware,
  requireAnyRole(["admin", "employee"]),
  createPromoCode
);

router.put(
  "/:id",
  authMiddleware,
  requireAnyRole(["admin", "employee"]),
  updatePromoCode
);

router.delete(
  "/:id",
  authMiddleware,
  requireAnyRole(["admin", "employee"]),
  deletePromoCode
);

router.post(
  "/apply",
  authMiddleware,
  requireAnyRole(["admin", "employee", "user"]),
  applyPromoCode
);

router.get("/public/active", getActivePromoCodes);

module.exports = router;
