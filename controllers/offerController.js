const Offer = require("../models/offerModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/ordersModel");
const Wishlist = require("../models/wishlistModel");
const Category = require("../models/categoryModel");
const productModel = require("../models/productModel");
const ReferralCode = require("../models/referalCodeModel");


const viewOffers = async (req, res) => {
  try {
    const updateResult = await Offer.updateMany(
      {
        endDate: { $lte: new Date() },
      },
      {
        $set: { isActive: false },
      }
    );

    const offers = await Offer.find({
      endDate: { $gte: new Date() },
    })
      .populate({
        path: "productOffer.products",
        model: "Product",
      })
      .populate({
        path: "categoryOffer.category",
        model: "category",
      });

    const referralOffers = await ReferralCode.find();

    res.render("offers", { offers, referralOffers });
  } catch (error) {
    console.log(error.message);
  }
};

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
    const editReferralOffer = await ReferralCode.findOne({
      _id: "65f685296d68b4e72942bd25",
    });

    res.render("addReferalOffer", { editReferralOffer });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategoryOffer = async (req, res) => {
  try {
  
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
};

const addProductOffer = async (req, res) => {
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
};

const addReferalOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      referredUserReward,
      referringUserReward,
    } = req.body;

    let referralOffer = await ReferralCode.findOne({
      _id: "65f685296d68b4e72942bd25",
    });

    referralOffer.title = req.body.title;
    referralOffer.description = req.body.description;
    referralOffer.startDate = req.body.startDate;
    referralOffer.endDate = req.body.endDate;
    referralOffer.referredUserReward = req.body.referredUserReward;
    referralOffer.referringUserReward = req.body.referringUserReward;

    await referralOffer.save();

    res.redirect("/admin/offers");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const toggleReferalStatus = async (req, res) => {
  try {
    const { offerId } = req.body;
    const offer = await ReferralCode.findById(offerId);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({ success: true, message: "Offer status toggled successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const toggleStatus = async (req, res) => {
  try {
   
    const { offerId } = req.body;
   

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
    
    await offer.save();

    if (offer.isActive) await applyActiveOffersToProducts(offerId);
    else removeInactiveOffersFromProducts(offerId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    res.json({ success: false });
  }
};

const applyActiveOffersToProducts = async (offerId) => {
  try {
  
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
  
  } catch (error) {
    console.error("Error applying active offers to products:", error);
  }
};

const removeInactiveOffersFromProducts = async (offerId) => {
  try {
   
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


const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    await Offer.findByIdAndDelete(offerId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ success: false, error: "Failed to delete offer" });
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
  toggleReferalStatus,
  deleteOffer,
};
