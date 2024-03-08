  const { ObjectId } = require("mongodb");
  const mongoose = require("mongoose");

  const productSchema = new mongoose.Schema(
    {
      pname: {
        type: String,
        required: true,
        index: true,
      },

      price: {
        type: Number,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      images: [
        {
          type: String,
        },
      ],

      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
      },

      brand: {
        type: String,
        required: false,
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

      is_listed: {
        type: String,
        default: 1,
      },
    },
    {
      strictPopulate: false,
    }
  );

  module.exports = mongoose.model("Product", productSchema);
