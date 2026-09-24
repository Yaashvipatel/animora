// Creates (or promotes) an admin user.
// Usage:
//   ADMIN_NAME="Animora Admin" ADMIN_EMAIL="admin@animora.com" ADMIN_PASSWORD="ChangeMe123!" node scripts/createAdmin.js
// Or set ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in your .env file and run: npm run create-admin

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

async function run() {
  const name = process.env.ADMIN_NAME || "Animora Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD (in .env or the shell) before running this script.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`✅ Existing user ${email} promoted to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isProfileComplete: true
    });
    console.log(`✅ Admin user created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(function (error) {
  console.error("❌ Failed to create admin:", error.message);
  process.exit(1);
});
