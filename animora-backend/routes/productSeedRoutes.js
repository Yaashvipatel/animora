const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.post("/products", async function (req, res) {
  try {
    // clear old products (optional)
    await Product.deleteMany({});

    const products = await Product.insertMany([
      { name: "Dog Food", category: "Food", price: 499, description: "Nutritious daily dog food, 3kg pack.", inStock: true },
      { name: "Cat Toy", category: "Toys", price: 199, description: "Feather wand toy for cats.", inStock: true },
      { name: "Grooming Kit", category: "Grooming", price: 699, description: "Complete brush, nail-clipper and comb kit.", inStock: true },
      { name: "Pet Shampoo", category: "Grooming", price: 299, description: "Gentle, tear-free shampoo for dogs and cats.", inStock: true },
      { name: "Dog Collar", category: "Accessories", price: 149, description: "Adjustable nylon collar, medium size.", inStock: true }
    ]);

    return res.json({ message: "Products seeded ✅", products: products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
