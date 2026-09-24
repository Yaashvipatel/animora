const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGO_URI)
    .then(function () {
      console.log("MongoDB Connected ✅");
    })
    .catch(function (error) {
      console.log("MongoDB Error ❌", error.message);
    });
}

module.exports = connectDB;
