const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionPet",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      default: "Pending" // Pending, Approved, Rejected
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
