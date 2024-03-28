const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    cartProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        size: {
          type: String,
          default: "XS",
        },
      },
    ],
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    cartTotal: {
      type: Number,
      required: false,
      default: 0,
    },
    oldCartTotal: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
