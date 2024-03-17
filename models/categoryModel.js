const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  cName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "disabled"],
    default: "active", 
  },
});

module.exports = mongoose.model("category", categorySchema);
