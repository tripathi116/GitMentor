const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe, updateProfile, logoutUser } = require("../controllers/auth.controllers"); // ★
const { protect } = require("../middlewares/auth.middleware"); 

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe); 
router.put("/profile", protect, updateProfile);

module.exports = router;