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
   console.log("status changes");
    await offer.save();


    if (offer.isActive)
     await applyActiveOffersToProducts(offerId);
else
removeInactiveOffersFromProducts(offerId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    res.json({ success: false });
  }
};



const applyActiveOffersToProducts = async (offerId) => {
  try {
    console.log("in apply offer");
    const offer = await Offer.findById(offerId)
      .populate({
        path: "productOffer.products",
        model: "Product",
      })
      .populate({
        path: "categoryOffer.category",
        model: "category",
      });

    let discountPercentage;

    if (offer.categoryOffer && offer.categoryOffer.category) {
      discountPercentage = offer.categoryOffer.discountPercentage;
      const categoryId = offer.categoryOffer.category._id;
      const categoryOfferProducts = await Product.find({
        category: categoryId,
      });

      const appliedOfferDetails = {
        offer: offer._id,
        discountPercentage: discountPercentage,
      };

      await Product.updateMany(
        { category: categoryId },
        { $push: { appliedOffers: appliedOfferDetails } }
      );
    }

    if (offer.productOffer && offer.productOffer.products) {
      discountPercentage = offer.productOffer.discountPercentage;
      const productIds = offer.productOffer.products.map(
        (product) => product._id
      );

      const appliedOfferDetails = {
        offer: offer._id,
        discountPercentage: discountPercentage,
      };

      await Product.updateMany(
        { _id: { $in: productIds } },
        { $push: { appliedOffers: appliedOfferDetails } }
      );
    }
await updateProductDiscount();
    console.log("Active offers applied to products successfully.");
  } catch (error) {
    console.error("Error applying active offers to products:", error);
  }
};


const removeInactiveOffersFromProducts = async (offerId) => {
  try {
    console.log("Removing inactive offer from products...");
    const offer = await Offer.findById(offerId)
      .populate({
        path: "productOffer.products",
        model: "Product",
      })
      .populate({
        path: "categoryOffer.category",
        model: "category",
      });

    if (!offer) {
      console.error(`Offer with ID ${offerId} not found.`);
      return;
    }

    if (offer.categoryOffer && offer.categoryOffer.category) {
      const categoryId = offer.categoryOffer.category._id;
      const result = await Product.updateMany(
        {
          category: categoryId,
          appliedOffers: { $elemMatch: { offer: offerId } },
        },
        { $pull: { appliedOffers: { offer: offerId } } }
      );
      
    }

    if (offer.productOffer && offer.productOffer.products.length > 0) {
      const productIds = offer.productOffer.products.map(
        (product) => product._id
      );
      const result = await Product.updateMany(
        {
          _id: { $in: productIds },
          appliedOffers: { $elemMatch: { offer: offerId } },
        },
        { $pull: { appliedOffers: { offer: offerId } } }
      );
     
    }
await updateProductDiscount();
    console.log(" offers removed from products successfully.");
  } catch (error) {
    console.error("Error removing inactive offers from products:", error);
  }
};

const updateProductDiscount = async () => {
  try {
    const products = await Product.find();

    for (const product of products) {
      const highestDiscountPercentage = product.appliedOffers.reduce(
        (maxDiscount, offer) => Math.max(maxDiscount, offer.discountPercentage),
        0
      );

      product.discountPercentage = highestDiscountPercentage;
      await product.save();
    }
  } catch (error) {
    console.error("Error updating product discountPercentage:", error);
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