
const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const productModel = require("../models/productModel");
const Coupon =require("../models/couponModel")

const viewCoupons = async (req, res) => {
  try {
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;

    
    const updateResult = await Coupon.updateMany(
      {
        expiryDate: { $lt: new Date() },
        status: { $ne: "blocked" },
      },
      {
        $set: { status: "blocked" },
      }
    );

 

    
    const totalCoupons = await Coupon.countDocuments({
      expiryDate: { $gte: new Date() },
    });

    
    const totalPages = Math.ceil(totalCoupons / itemsPerPage);
    const visiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    const skipCount = (currentPage - 1) * itemsPerPage;

    const coupons = await Coupon.find({
      expiryDate: { $gte: new Date() },
    })
      .sort({ expiryDate: -1 }) 
      .skip(skipCount)
      .limit(itemsPerPage);

    const error = req.query.error;

    res.render("coupons", {
      coupons,
      currentPage,
      totalPages,
      startPage,
      endPage,
      error,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};



const createCoupon = async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      minimumOffer,
      expiryDate,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.trim() });

    if (existingCoupon) {
      res.redirect("/admin/coupons?error=Coupon already exists");
     setTimeout(() => {
       res.redirect("/admin/coupons");
     }, 10000); 
    
    }

    const newCoupon = new Coupon({
      name,
      code,
      discountType,
      discountValue,
      minimumOffer, 
      expiryDate,
      status: "active",
    });

    await newCoupon.save();

    // const timeUntilExpiry = new Date(expiryDate).getTime() - Date.now();
    // if (timeUntilExpiry > 0) {
    //   setTimeout(async () => {
    //     await Coupon.updateOne(
    //       { _id: newCoupon._id },
    //       { $set: { status: "inactive" } }
    //     );
    //   }, timeUntilExpiry);
    // }


    res.redirect("/admin/coupons");
  } catch (error) {
    console.error(error.message);
   
  
  }
};



const editCouponStatus = async (req, res) => {
  try {
   
     const { couponID } = req.query;
   
    const coupon = await Coupon.findById(couponID);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // const now = new Date();
    // if (coupon.expiryDate < now) {
    //   return res
    //     .status(400)
    //     .json({ error: "Cannot edit status for an expired coupon" });
    // }

    coupon.status = coupon.status === "active" ? "blocked" : "active";

    await coupon.save();

    res.redirect("/admin/coupons");
    
  } catch (err) {
    console.error(err);
   
  }
};

const viewCoupon=async(req,res)=>{
    try {
        
         const { couponID } = req.query;
          const coupon = await Coupon.findById(couponID);
          res.render("viewCoupon", { coupon });
        
    } catch (error) {
          console.error(err);
    }
}

const viewEditCoupon = async (req, res) => {
  try {
    const { couponID } = req.query;
    const coupon = await Coupon.findById(couponID);
    res.render("editCoupon", { coupon });
  } catch (error) {
    console.error(err);
  }
};

const editCoupon = async (req, res) => {
  try {
    const {
      couponId,
      name,
      code,
      discountType,
      discountValue,
      expiryDate,
      
      minimumOffer,
    } = req.body;

    const existingCoupon = await Coupon.findById(couponId);

    if (!existingCoupon) {
      return res.status(404).send("Coupon not found");
    }

    existingCoupon.name = name;
    existingCoupon.code = code;
    existingCoupon.discountType = discountType;
    existingCoupon.discountValue = discountValue;
    existingCoupon.expiryDate = expiryDate;
    existingCoupon.minimumOffer = minimumOffer;

    await existingCoupon.save();

    res.redirect(`/admin/coupons`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



module.exports = {
  viewCoupons,
  createCoupon,
  editCouponStatus,
  viewCoupon,
  viewEditCoupon,
  editCoupon,
};

