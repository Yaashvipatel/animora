const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Get all products — supports search/category filter/pagination
router.get("/", async function (req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.name = new RegExp(req.query.search.trim(), "i");

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter)
    ]);

    return res.json({
      products: products,
      page: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalResults: total
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Add product
router.post("/add", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { name, category, price, image, description, inStock } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: "Name, category and price are required" });
    }

    const newProduct = new Product({
      name: name,
      category: category,
      price: Number(price),
      image: image || "",
      description: description || "",
      inStock: inStock !== undefined ? inStock : true
    });

    await newProduct.save();

    return res.status(201).json({ message: "Product added ✅", product: newProduct });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Update product
router.put("/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { name, category, price, image, description, inStock } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        category: category,
        price: Number(price),
        image: image || "",
        description: description || "",
        inStock: inStock
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product updated ✅", product: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Delete product
router.delete("/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted ✅" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
