const express = require("express");
const Doctor = require("../models/Doctor");

const router = express.Router();

router.post("/doctors", async function (req, res) {
  try {
    await Doctor.deleteMany({});

    const doctors = await Doctor.insertMany([
      {
        name: "Dr. Aisha Mehta",
        specialization: "Pet Skin & Allergy Specialist",
        experience: "6+ years",
        fee: 499,
        availableDays: ["Mon", "Wed", "Fri"],
        availableSlots: ["10:00 AM", "12:00 PM", "05:00 PM"],
        hospital: "Animora Vet Care"
      },
      {
        name: "Dr. Rohan Patel",
        specialization: "General Veterinary Surgeon",
        experience: "8+ years",
        fee: 699,
        availableDays: ["Tue", "Thu", "Sat"],
        availableSlots: ["11:00 AM", "02:00 PM", "06:00 PM"],
        hospital: "City Pet Hospital"
      },
      {
        name: "Dr. Neha Sharma",
        specialization: "Emergency & Critical Care",
        experience: "5+ years",
        fee: 899,
        availableDays: ["Mon", "Tue", "Sun"],
        availableSlots: ["09:00 AM", "01:00 PM", "07:00 PM"],
        hospital: "Animal Rescue Clinic"
      }
    ]);

    return res.json({ message: "Doctors seeded ✅", doctors: doctors });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
