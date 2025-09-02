const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// @route POST /api/auth/register
router.post("/register", registerUser);

// @route POST /api/auth/login
router.post("/login", loginUser);

// @route POST /api/auth/logout
router.post("/logout", logoutUser);

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route" });
});
module.exports = router;
