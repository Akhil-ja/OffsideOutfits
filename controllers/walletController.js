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
    const { amount } = req.query;
    const userID = res.locals.currentUser._id;

    let wallet = await Wallet.findOne({ user: userID });

    if (!wallet) {
      wallet = new Wallet({
        user: userID,
        money: parseFloat(amount),
        transactions: [
          {
            amount: parseFloat(amount),
            type: "credit",
          },
        ],
      });

      await wallet.save();
    } else {
      
      wallet.money += parseFloat(amount);
      wallet.transactions.push({
        amount: parseFloat(amount),
        type: "credit",
      });
      await wallet.save();
    }

    res.redirect("/profile?selected=wallet");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const ViewWalletHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const transactionsPerPage = 6;
    const userID = res.locals.currentUser._id;

    const wallet = await Wallet.findOne({ user: userID });
    const transactionsCount = wallet.transactions.length;
    const totalPages = Math.ceil(transactionsCount / transactionsPerPage);

    
    wallet.transactions.sort((a, b) => b.createdAt - a.createdAt);

    const safePageNumber = Math.max(1, Math.min(page, totalPages));

    const startIndex = (safePageNumber - 1) * transactionsPerPage;
    const endIndex = Math.min(
      startIndex + transactionsPerPage,
      transactionsCount
    );
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