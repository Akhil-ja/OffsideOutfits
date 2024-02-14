const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  address: [
    {
      AddName: {
        type: String,
        required: true,
      },
      House: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },

      PIN: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: "home",
      },
    },
  ],
},{
    strictPopulate: false,
  });

module.exports = mongoose.model("Address", userSchema);
