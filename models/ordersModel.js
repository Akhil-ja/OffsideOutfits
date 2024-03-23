const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderID: {
      type: String,
      required: true,
      unique: true,
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
        size: {
          type: String,
          required: true,
        },
      },
    ],
    orderTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "returned", "cancelled", "delivered"],
      default: "pending",
    },
    returnReason: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: Object,
      required: false,
    },
    PaymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Orders", orderSchema);
