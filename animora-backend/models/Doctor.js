const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
    fee: { type: Number, required: true },
    availableDays: [{ type: String }],   // ["Mon","Tue"...]
    availableSlots: [{ type: String }],  // ["10:00 AM", "12:00 PM"]
    hospital: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
