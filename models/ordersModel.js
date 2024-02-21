const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "delivered"],
      default: "pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },

    address: {
      type: Object,
      required: true,
    },
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Orders", orderSchema);
