const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/ordersModel");
const Wishlist = require("../models/wishlistModel");
const Wallet=require("../models/walletModel")

const razorpay = require("razorpay");


const rzp = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});





const addToWallet = async (req, res) => {
  try {
   const amount = req.body.amount

   console.log("amount:" + amount);

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "razorUser@gmail.com",
    };

    rzp.orders.create(options, (err, order) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Error creating order." });
      }

      const orderID = order.id;
      console.log("orderID");

      return res.status(200).json({
        success: true,
        msg: "Order created successfully",
        order_id: orderID,
        amount: amount,
        key_id: process.env.RAZORPAY_KEY_ID,
        contact: 8469237811,
        name: "Offside Outfits",
        email: "akhiljagadish124@gmail.com",
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const addMoney = async (req, res) => {
  try {
    console.log("add money");

    const { amount } = req.query;
    const userID = res.locals.currentUser._id;

    let wallet = await Wallet.findOne({ user: userID });

    wallet.money += parseFloat(amount);

    wallet.transactions.push({
      amount: parseFloat(amount),
      type: "credit", 
    });

    await wallet.save();
    console.log("redirect");
    res.redirect("/profile?selected=wallet");
  } catch (error) {
    console.error(error.message);
  }
};

const ViewWalletHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Parse the page number as an integer
    const transactionsPerPage = 2;
    const userID = res.locals.currentUser._id;

    const wallet = await Wallet.findOne({ user: userID });
    const transactionsCount = wallet.transactions.length;
    const totalPages = Math.ceil(transactionsCount / transactionsPerPage);

    // Ensure the page number is within valid bounds
    const safePageNumber = Math.max(1, Math.min(page, totalPages));

    const startIndex = (safePageNumber - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const transactions = wallet.transactions.slice(startIndex, endIndex);

    res.render("walletHistory", {
      transactions: transactions,
      totalPages: totalPages,
      currentPage: safePageNumber,
    });
  } catch (error) {
    console.error(error.message);
   
  }
};



module.exports = {
  addToWallet,
  addMoney,
  ViewWalletHistory,
};