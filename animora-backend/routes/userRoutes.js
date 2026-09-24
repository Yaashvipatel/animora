const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ GET logged-in user
router.get("/me", authMiddleware, async function (req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ COMPLETE PROFILE
router.put("/complete-profile", authMiddleware, async function (req, res) {
  try {
    const { phone, address, city, state, hasPet } = req.body;

    if (!phone || !address || !city || !state || !hasPet) {
      return res.status(400).json({ message: "All profile fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        phone: phone,
        address: address,
        city: city,
        state: state,
        hasPet: hasPet,
        isProfileComplete: true
      },
      { new: true }
    ).select("-password");

    return res.json({
      message: "Profile updated ✅",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
