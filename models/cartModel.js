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
         default:'XS'
        },
      },
    ],
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
