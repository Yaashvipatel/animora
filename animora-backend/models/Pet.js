const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  age: { type: String, required: true },
  nature: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String, default: "🐾" }
}, { timestamps: true });

module.exports = mongoose.model("Pet", petSchema);
