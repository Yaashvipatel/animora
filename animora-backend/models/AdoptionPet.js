const mongoose = require("mongoose");

const adoptionPetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // Dog / Cat / etc
    age: { type: String, required: true },
    gender: { type: String, required: true }, // Male/Female
    nature: { type: String, default: "" }, // Friendly, calm etc

    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },

    image: { type: String, default: "" },
    description: { type: String, default: "" },

    centreName: { type: String, required: true },
    centreAddress: { type: String, required: true },
    city: { type: String, required: true },

    contactPhone: { type: String, required: true },

    adoptionFee: { type: Number, default: 0 },

    isAdopted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdoptionPet", adoptionPetSchema);
