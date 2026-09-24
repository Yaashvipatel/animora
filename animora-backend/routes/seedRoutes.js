const express = require("express");
const Pet = require("../models/Pet");

const router = express.Router();

router.post("/pets", async function (req, res) {
  try {
    // clear old pets (optional)
    await Pet.deleteMany({});

    const pets = await Pet.insertMany([
      {
        name: "Buddy",
        type: "Dog",
        age: "2 years",
        nature: "Friendly",
        description: "Buddy is a playful and loving dog who enjoys walks and belly rubs.",
        emoji: "🐶"
      },
      {
        name: "Misty",
        type: "Cat",
        age: "1 year",
        nature: "Calm",
        description: "Misty is a calm and sweet cat who loves cozy naps and gentle cuddles.",
        emoji: "🐱"
      },
      {
        name: "Snowy",
        type: "Rabbit",
        age: "6 months",
        nature: "Cute",
        description: "Snowy is an adorable rabbit who loves carrots and soft blankets.",
        emoji: "🐰"
      }
    ]);

    return res.json({ message: "Pets seeded ✅", pets: pets });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
