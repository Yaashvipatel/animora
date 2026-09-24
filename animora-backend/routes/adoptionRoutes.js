const express = require("express");
const AdoptionPet = require("../models/AdoptionPet");
const AdoptionRequest = require("../models/AdoptionRequest");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* ✅ Get all pets (available for adoption) — supports search/filter/pagination */
router.get("/pets", async function (req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const filter = { isAdopted: false };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.city) filter.city = new RegExp("^" + req.query.city.trim(), "i");
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search.trim(), "i") },
        { breed: new RegExp(req.query.search.trim(), "i") },
        { centreName: new RegExp(req.query.search.trim(), "i") }
      ];
    }

    const [pets, total] = await Promise.all([
      AdoptionPet.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdoptionPet.countDocuments(filter)
    ]);

    return res.json({
      pets: pets,
      page: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalResults: total
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Add pet (Admin) */
router.post("/pets/add", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const {
      name,
      type,
      age,
      gender,
      nature,
      vaccinated,
      neutered,
      image,
      description,
      centreName,
      centreAddress,
      city,
      contactPhone,
      adoptionFee
    } = req.body;

    if (!name || !type || !age || !gender || !centreName || !centreAddress || !city || !contactPhone) {
      return res.status(400).json({ message: "Please fill all required fields ❌" });
    }

    const newPet = new AdoptionPet({
      name: name,
      type: type,
      age: age,
      gender: gender,
      nature: nature || "",
      vaccinated: vaccinated || false,
      neutered: neutered || false,
      image: image || "",
      description: description || "",
      centreName: centreName,
      centreAddress: centreAddress,
      city: city,
      contactPhone: contactPhone,
      adoptionFee: adoptionFee || 0
    });

    await newPet.save();

    return res.status(201).json({
      message: "Pet added ✅",
      pet: newPet
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Update pet (Admin) */
router.put("/pets/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const updated = await AdoptionPet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Pet not found ❌" });
    }

    return res.json({
      message: "Pet updated ✅",
      pet: updated
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Delete pet (Admin) */
router.delete("/pets/:id", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const deleted = await AdoptionPet.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Pet not found ❌" });
    }

    return res.json({ message: "Pet deleted ✅" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Send adoption request (User) */
router.post("/request/:petId", authMiddleware, async function (req, res) {
  try {
    const petId = req.params.petId;

    const pet = await AdoptionPet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found ❌" });
    }

    const existing = await AdoptionRequest.findOne({
      petId: petId,
      userId: req.user.id
    });

    if (existing) {
      return res.status(400).json({ message: "You already requested for this pet ✅" });
    }

    const newRequest = new AdoptionRequest({
      petId: petId,
      userId: req.user.id
    });

    await newRequest.save();

    return res.status(201).json({
      message: "Adoption request sent ✅",
      request: newRequest
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ My adoption requests (User) */
router.get("/my-requests", authMiddleware, async function (req, res) {
  try {
    const requests = await AdoptionRequest.find({ userId: req.user.id })
      .populate("petId")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: get all adoption requests */
router.get("/requests/all", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const requests = await AdoptionRequest.find()
      .populate("petId")
      .populate("userId", "name email phone city")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ✅ Admin: approve/reject an adoption request */
router.put("/requests/:id/status", authMiddleware, adminMiddleware, async function (req, res) {
  try {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Pending, Approved or Rejected ❌" });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found ❌" });
    }

    request.status = status;
    await request.save();

    // Mark the pet as adopted once a request is approved
    if (status === "Approved") {
      await AdoptionPet.findByIdAndUpdate(request.petId, { isAdopted: true });
    }

    return res.json({ message: "Request updated ✅", request: request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
