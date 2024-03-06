const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/ordersModel");
const Wishlist=require("../models/wishlistModel")


const addToWishlist=async(req,res)=>{
    console.log("in add to wishlist");

         const { productId } = req.body;
         console.log("Product ID:"+productId);

         
         const userId = res.locals.currentUser._id;
         console.log("userid:"+userId);

         try {
          const existingWishlist = await Wishlist.findOne({
            user: userId,
            "cartProducts.product": productId,
          });

          if (existingWishlist) {
            console.log("Already exist");
            return res
              .status(400)
              .json({ success: false, error: "Product already in wishlist" });
          }
           const wishlist = await Wishlist.findOneAndUpdate(
             { user: userId },
             { $addToSet: { cartProducts: { product: productId } } },
             { upsert: true, new: true }
           );

           res.json({ success: true, wishlist });


         } catch (error) {
           console.error("Error adding product to wishlist:", error);
           res
             .status(500)
             .json({ success: false, error: "Internal Server Error" });
         }
    } 

    const viewWishlist=async(req,res)=>{
        try {
            const wishlistItems = await Wishlist.find();
            res.render("wishlistItems", { wishlistItems });
        } catch (error) {
            console.error(error.message);
        }
    }




module.exports = {
  addToWishlist,
};

























