const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

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
    transactions: [transactionSchema], 
  },
  {
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
