const mongoose = require("mongoose");

const referralCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    offer: {
      type: Number,
      ref: "Offer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReferralCode", referralCodeSchema);
