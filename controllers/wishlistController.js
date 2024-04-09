const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/ordersModel");
const Wishlist=require("../models/wishlistModel")



const addToWishlist = async (req, res) => {


  const { productId } = req.body;


  const userId = res.locals.currentUser._id;


  try {
    const existingWishlist = await Wishlist.findOne({
      user: userId,
      "wishlistProducts.product": productId,
    });

    if (existingWishlist) {
   
      return res
        .status(400)
        .json({ success: false, error: "Product already in wishlist" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { wishlistProducts: { product: productId } } },
      { upsert: true, new: true }
    );

    res.json({ success: true, wishlist });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const viewWishlist = async (req, res) => {
  try {
    const userId = res.locals.currentUser._id;

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "wishlistProducts.product",
      model: "Product",
    });

    

    if (!wishlist) {
      return res.render("wishlist", { wishlistItems: [] });
    }

    const wishlistItems = wishlist.wishlistProducts.map((item) => item.product);

   
    res.render("wishlist", { wishlistItems });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};




const removeFromwishlist=async(req,res)=>{


     const {  productId } = req.body;

    
const userId = res.locals.currentUser._id;


     try {
       const wishlist = await Wishlist.findOne({ user: userId }).populate({
         path: "wishlistProducts.product",
         model: "Product",
       });


       if (!wishlist) {
         return res.status(404).json({ error: "Wishlist not found." });
       }

       const productIndex = wishlist.wishlistProducts.findIndex((product) =>
         product.product.equals(productId)
       );

       if (productIndex === -1) {
         return res
           .status(404)
           .json({ error: "Product not found in the wishlist." });
       }

       wishlist.wishlistProducts.splice(productIndex, 1);
       await wishlist.save();

       return res.status(200).json({
         success: true,
         message: "Product removed from the wishlist.",
         wishlistCount: wishlist.wishlistProducts.length,
       });
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: "Internal server error." });
     }
}



module.exports = {
  addToWishlist,
  viewWishlist,
  removeFromwishlist,
};

























