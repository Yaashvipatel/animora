const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    petName: { type: String, required: true },
    issue: { type: String, required: true },

    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },

    phone: { type: String, required: true },

    fee: { type: Number, required: true },

    mode: { type: String, default: "Online" },

    status: { type: String, default: "Booked" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
