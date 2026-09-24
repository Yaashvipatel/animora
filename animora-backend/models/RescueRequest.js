const mongoose = require("mongoose");

const rescueRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    animalType: { type: String, required: true }, // Dog/Cat/Bird/Other
    condition: { type: String, required: true },  // Injured/Trapped etc

    image: { type: String, default: "" },         // Image URL
    message: { type: String, default: "" },

    city: { type: String, required: true },
    address: { type: String, required: true },

    // ✅ NEW: Maps link
    mapsLink: { type: String, default: "" },

    status: {
      type: String,
      default: "Pending" // Pending, In Progress, Rescued
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RescueRequest", rescueRequestSchema);
