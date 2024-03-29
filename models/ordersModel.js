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
    originalOrderTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "returned",
        "cancelled",
        "delivered",
        "payment failed",
      ],
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
    productEdited: {
      type: Boolean,
      default:false
    },
    address: {
      type: Object,
      required: false,
    },
    PaymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Orders", orderSchema);
