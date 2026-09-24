const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const APPOINTMENT_STATUSES = ["Booked", "Confirmed", "Completed", "Cancelled"];

// ✅ Book Appointment
router.post("/book", authMiddleware, async function (req, res) {
  try {
    const {
      doctorId,
      petName,
      issue,
      appointmentDate,
      appointmentTime,
      phone,
      mode
    } = req.body;

    if (!doctorId || !petName || !issue || !appointmentDate || !appointmentTime || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      doctorId: doctorId,
      petName: petName,
      issue: issue,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      phone: phone,
      fee: doctor.fee,
      mode: mode || "Online"
    });

    await newAppointment.save();

    return res.status(201).json({
      message: "Appointment booked ✅",
      appointment: newAppointment
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Get My Appointments
router.get("/my", authMiddleware, async function (req, res) {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate("doctorId")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: get all appointments — paginated, filterable by status */
router.get("/all", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("userId", "name email phone")
        .populate("doctorId", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Appointment.countDocuments(filter)
    ]);

    return res.json({
      appointments: appointments,
      page: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalResults: total
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: update appointment status */
router.put("/:id/status", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { status } = req.body;

    if (!APPOINTMENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be one of: " + APPOINTMENT_STATUSES.join(", ") });
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: status }, { new: true });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found ❌" });
    }

    return res.json({ message: "Appointment updated ✅", appointment: appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
