const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const ORDER_STATUSES = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// ✅ Checkout / Place Order
router.post("/checkout", authMiddleware, async function (req, res) {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty ❌" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount ❌" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items: items,
      totalAmount: totalAmount
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Order placed ✅",
      order: newOrder
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ My Orders (optional now, will use later)
router.get("/my", authMiddleware, async function (req, res) {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: get all orders — paginated, filterable by status */
router.get("/all", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    return res.json({
      orders: orders,
      page: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalResults: total
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: update order status */
router.put("/:id/status", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be one of: " + ORDER_STATUSES.join(", ") });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    return res.json({ message: "Order updated ✅", order: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
