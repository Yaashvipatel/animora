const express = require("express");
const Pet = require("../models/Pet");

const router = express.Router();

// GET all pets
router.get("/", async function (req, res) {
  try {
    const pets = await Pet.find();
    return res.json(pets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET one pet by id
router.get("/:id", async function (req, res) {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
