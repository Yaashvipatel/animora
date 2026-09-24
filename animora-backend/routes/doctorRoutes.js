const express = require("express");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Get all doctors
router.get("/", async function (req, res) {
  try {
    const doctors = await Doctor.find();
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Get doctor by id
router.get("/:id", async function (req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Add doctor
router.post("/add", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const {
      name,
      specialization,
      experience,
      fee,
      hospital,
      availableDays,
      availableSlots
    } = req.body;

    if (!name || !specialization || !experience || !fee || !availableDays || !availableSlots) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newDoctor = new Doctor({
      name: name,
      specialization: specialization,
      experience: experience,
      fee: Number(fee),
      hospital: hospital || "",
      availableDays: availableDays,
      availableSlots: availableSlots
    });

    await newDoctor.save();

    return res.status(201).json({
      message: "Doctor added ✅",
      doctor: newDoctor
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Update doctor
router.put("/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const {
      name,
      specialization,
      experience,
      fee,
      hospital,
      availableDays,
      availableSlots
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience || doctor.experience;
    doctor.fee = fee !== undefined ? Number(fee) : doctor.fee;
    doctor.hospital = hospital !== undefined ? hospital : doctor.hospital;
    doctor.availableDays = availableDays || doctor.availableDays;
    doctor.availableSlots = availableSlots || doctor.availableSlots;

    await doctor.save();

    return res.json({
      message: "Doctor updated ✅",
      doctor: doctor
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Delete doctor
router.delete("/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    return res.json({ message: "Doctor deleted ✅" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
