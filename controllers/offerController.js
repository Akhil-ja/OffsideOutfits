const Offer=require("../models/offerModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/ordersModel");
const Wishlist = require("../models/wishlistModel");
const Category = require("../models/categoryModel");
const productModel = require("../models/productModel");

const viewOffers=async(req,res)=>{
    try {
const offers = await Offer.find()
  .populate({
    path: "productOffer.products",
    model: "Product",
  })
  .populate({
    path: "categoryOffer.category",
    model: "category",
  });


        res.render("offers", { offers });
    } catch (error) {
        console.log(error.message);
    }
}



const CategoryOffer = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("addCategoryOffer", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

const ProductOffer = async (req, res) => {
  try {
    const products = await productModel.find();
    res.render("addProductOffer", { products });
  } catch (error) {
    console.log(error.message);
  }
};


const ReferalOffer = async (req, res) => {
  try {
   res.render("addReferalOffer");;
  } catch (error) {
    console.log(error.message);
  }
};

const addCategoryOffer=async(req,res)=>{
   try {
    console.log("in add category");
     const {
       title,
       description,
       startDate,
       endDate,
       category,
       discountPercentage,
     } = req.body;

     
     const categoryOffer = new Offer({
       title,
       description,
       startDate,
       endDate,
       categoryOffer: {
         category, 
         discountPercentage,
       },
     });

     await categoryOffer.save();
     res.redirect("/admin/offers");
   } catch (error) {
     console.error(error.message);
    
   }
}

const addProductOffer=async(req,res)=>{
try {
 
 
  const {
    title,
    description,
    startDate,
    endDate,
    selectedProducts,
    discountPercentage,
  } = req.body;

  const productOffer = new Offer({
    title,
    description,
    startDate,
    endDate,
    productOffer: {
      products: selectedProducts,
      discountPercentage,
    },
  });

  await productOffer.save();

  res.redirect("/admin/offers");
} catch (error) {
  console.error(error.message);
}
}

const  addReferalOffer=async(req,res)=>{
   try {
     const {
       title,
       description,
       startDate,
       endDate,
       referredUserReward,
       referringUserReward,
     } = req.body;

     const referralOffer = new Offer({
       title,
       description,
       startDate,
       endDate,
       referralOffer: {
         referredUserReward,
         referringUserReward,
       },
     });

     await referralOffer.save();

  res.redirect("/admin/offers");
   } catch (error) {
     console.error(error.message);
   }
}


const toggleStatus = async (req, res) => {
  try {

    console.log("in toggle");
    console.log("toggle status");
    const { offerId } = req.body;
    console.log("offerId:" + offerId);

    const offer = await Offer.findById(offerId)
      .populate({
        path: "productOffer.products",
        model: "Product",
      })
      .populate({
        path: "categoryOffer.category",
        model: "category",
      });

   
    offer.isActive = !offer.isActive;

   if (offer.isActive===true) {
    if (offer.categoryOffer) {
      const category = offer.categoryOffer.category;
      const productsToUpdate = await Product.find({ category: category._id });

      for (const product of productsToUpdate) {
        product.discountPercentage = offer.categoryOffer.discountPercentage;
        await product.save();
      }
    } else if (offer.productOffer) {
      const productsToUpdate = offer.productOffer.products;

      for (const product of productsToUpdate) {
        product.discountPercentage = offer.productOffer.discountPercentage;
        await product.save();
      }
    }

   }
    
   
    await offer.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    res.json({ success: false });
  }
};





module.exports = {
  viewOffers,
  ReferalOffer,
  ProductOffer,
  CategoryOffer,
  addCategoryOffer,
  addProductOffer,
  addReferalOffer,
  toggleStatus,
};