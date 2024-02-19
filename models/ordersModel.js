const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Assuming you have a Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"], // Add other status values as needed
    default: "pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },

  address:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model("Orders", cartSchema);
