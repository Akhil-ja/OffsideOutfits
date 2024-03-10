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
      discountPercentage: {
        type: Number,
        default: 0,
      },
       priceAfterDiscount: {
      type: Number,
      
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
      appliedOffers: [
        {
          offer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer", 
            required: true,
          },
          discountPercentage: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    {
      strictPopulate: false,
    }
  );

productSchema.pre("save", function (next) {
  const discountedPrice =
    this.price - (this.price * this.discountPercentage) / 100;
  this.priceAfterDiscount = discountedPrice;
  next();
});

  module.exports = mongoose.model("Product", productSchema);
