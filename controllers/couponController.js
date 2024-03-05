
const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const productModel = require("../models/productModel");
const Coupon =require("../models/couponModel")

const viewCoupons=async(req,res)=>{
    try {
        const coupons=await Coupon.find();
        res.render("coupons", { coupons });
    } catch (error) {
        console.error(error.message); 
    }
}

const createCoupon = async (req, res) => {
  try {
    const { name, code, discountType, discountValue, expiryDate } = req.body;

    console.log(req.body);

    const newCoupon = new Coupon({
      name: name,
      code: code,
      discountType: discountType,
      discountValue: discountValue,
      expiryDate: expiryDate,
      status: "active",
    });

    await newCoupon.save();

      res.redirect("/admin/coupons")
    
  } catch (error) {
    console.error(error.message);
   
  }
};

const editCouponStatus = async (req, res) => {
  try {
   
     const { couponID } = req.query;
      console.log("couponID:"+couponID);
    const coupon = await Coupon.findById(couponID);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

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

const editCoupon=async(req,res)=>{
     try {
         console.log("in edit coupon");
       const { couponId, name, code, discountType, discountValue, expiryDate } =
         req.body;
console.log(req.body.couponId);
       
       const existingCoupon = await Coupon.findById(couponId);

       console.log(existingCoupon);

       if (!existingCoupon) {
         return res.status(404).send("Coupon not found");
       }

   
       existingCoupon.name = name;
       existingCoupon.code = code;
       existingCoupon.discountType = discountType;
       existingCoupon.discountValue = discountValue;
       existingCoupon.expiryDate = expiryDate;

       
       await existingCoupon.save();

      
       res.redirect(`/admin/coupons`);
     } catch (error) {
       console.error(error);
       res.status(500).send("Internal Server Error");
     }
}
module.exports = {
  viewCoupons,
  createCoupon,
  editCouponStatus,
  viewCoupon,
  viewEditCoupon,
  editCoupon,
};

