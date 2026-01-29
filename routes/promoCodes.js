const express = require("express");
const router = express.Router();

const {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
} = require("../controllers/promoCodesController");

const {
  authMiddleware,
  requireRole,
  requireAnyRole,
} = require("../middlewares/auth");

// Admin & Employee can view list/details
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

// Admin-only mutation routes
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  createPromoCode
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  updatePromoCode
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  deletePromoCode
);

// Apply endpoint for any logged-in user type
router.post(
  "/apply",
  authMiddleware,
  requireAnyRole(["admin", "employee", "user"]),
  applyPromoCode
);

module.exports = router;
