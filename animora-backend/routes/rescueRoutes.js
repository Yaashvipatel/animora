const express = require("express");
const RescueRequest = require("../models/RescueRequest");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* ✅ Create rescue request (User) */
router.post("/create", authMiddleware, async function (req, res) {
  try {
    const { animalType, condition, image, message, city, address, mapsLink } = req.body;

    if (!animalType || !condition || !city || !address) {
      return res.status(400).json({ message: "Please fill all required fields ❌" });
    }

    const newReq = new RescueRequest({
      userId: req.user.id,
      animalType: animalType,
      condition: condition,
      image: image || "",
      message: message || "",
      city: city,
      address: address,
      mapsLink: mapsLink || ""
    });

    await newReq.save();

    return res.status(201).json({
      message: "Rescue request submitted ✅",
      rescue: newReq
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ My rescue requests (User) */
router.get("/my", authMiddleware, async function (req, res) {
  try {
    const my = await RescueRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(my);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: get all rescue requests */
router.get("/all", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const all = await RescueRequest.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: update rescue status */
router.put("/status/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required ❌" });
    }

    const updated = await RescueRequest.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found ❌" });
    }

    return res.json({
      message: "Status updated ✅",
      rescue: updated
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
