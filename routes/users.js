const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authMiddleware, requireRole } = require("../middlewares/auth");

router.post("/login", usersController.login);
router.post("/register", usersController.register);


router.get("/me", authMiddleware, usersController.getMe);
router.put("/me/username", authMiddleware, usersController.updateUsername);
router.put("/me/password", authMiddleware, usersController.changePassword);
router.delete("/me", authMiddleware, usersController.deleteAccount);

router.get("/", authMiddleware, requireRole("admin"), usersController.getAllUsers);

module.exports = router;

