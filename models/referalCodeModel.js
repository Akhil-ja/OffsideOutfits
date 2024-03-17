const mongoose = require("mongoose");

const referralCodeSchema = new mongoose.Schema(
  {
  
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
    referredUserReward: { type: Number, default: 0 },
    referringUserReward: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReferralCode", referralCodeSchema);
