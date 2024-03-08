const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    money: {
      type: Number,
      required: true,
    },
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
