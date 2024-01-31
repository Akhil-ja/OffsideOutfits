const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pname: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  sizes: [
    {
      size: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: true,
  },

  is_listed: {
    type: Number,
    required: true,
  },

});

module.exports = mongoose.model("Product", productSchema);