const User = require("../models/userModel");
const authRoutes = require("../services/authRoutes");
const bcrypt = require("bcrypt");
const Order = require("../models/ordersModel");
const Product = require("../models/productModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


const Category=require("../models/categoryModel")








const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminLog = async (req, res) => {
  try {
    const errorMessage = req.query.error || req.session.errorMessage;
    req.session.errorMessage = null;
   res.cookie("jwt", "", { maxAge: 1 });  
    res.render("login", { errorMessage });
  } catch (error) {
    console.log(error.message);
  }
};



const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      console.log(password);
      console.log(userData.password);

      if (passwordMatch && userData.is_admin === "1") {
        const userID = userData._id;
        console.log(userData.name);

        const token = authRoutes.createToken(userID);
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: authRoutes.maxAge * 1000,
        });
        console.log(token);

        res.redirect("/admin/products");
      } else if (userData.is_admin === "0") {
        res.render("login", {
          errorMessage: "You do not have permission to access the admin panel.",
        });
      } else {
        res.render("login", {
          errorMessage: "Incorrect password or invalid credentials.",
        });
      }
    } else {
      res.render("login", { errorMessage: "User does not exist." });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const adminLogout= async(req,res)=>{
  try {
    res.cookie('jwt','',{maxAge:1});
    console.log("Admin logout");
    res.redirect("/admin/login")
  } catch (error) {
    console.log(error.message);
  }
}




const viewDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

   
    const sortedOrders = await Order.find()
      .populate({
        path: "products.product",
        model: "Product",
      })
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "couponApplied",
        model: "Coupon",
      })
      .sort({ orderDate: -1 });

    
    const orders = sortedOrders.slice(skip, skip + limit);

    const totalOrders = sortedOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);

    const totalRevenue = sortedOrders.reduce(
      (sum, order) => sum + order.orderTotal,
      0
    );
    const totalProducts = await Product.countDocuments();

    res.render("dashboard", {
      orders,
      totalRevenue,
      totalOrders,
      totalProducts,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};











const loadadminProducts = async (req, res) => {
  try {
    const itemsPerPage = 6; 
    const currentPage = parseInt(req.query.page) || 1;

   
    const totalProducts = await Product.countDocuments();
  
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

   
    const visiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));

    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    
    const skipCount = (currentPage - 1) * itemsPerPage;

   
    const products = await Product.find().skip(skipCount).limit(itemsPerPage);

   
    const categories = await Category.find();

 
    res.render("products", {
      products,
      categories,
      currentPage,
      totalPages,
      startPage,
      endPage,
    });
  } catch (error) {
    console.error(error.message);
  }
};









const filterOrdersByDate = async (req, res) => {
  try {
    let query = {};
    const { startDate, endDate, timeFilter } = req.query;

    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.orderDate = { $gte: startDateTime, $lte: endDateTime };
    }

    if (timeFilter && timeFilter !== "All") {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (timeFilter === "daily") {
        query.orderDate = { $gte: currentDate };
      } else if (timeFilter === "weekly") {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        query.orderDate = { $gte: startOfWeek };
      } else if (timeFilter === "monthly") {
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        startOfMonth.setHours(0, 0, 0, 0);
        query.orderDate = { $gte: startOfMonth };
      } else if (timeFilter === "yearly") {
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        query.orderDate = { $gte: startOfYear };
      }
    }

    const orders = await Order.find(query)
      .populate({
        path: "products.product",
        model: "Product",
      })
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "couponApplied",
        model: "Coupon",
      })
      .sort({ orderDate: "desc" });

    res.json({ orders });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





module.exports = {
  loadAdminLog,
  adminLogin,
  adminLogout,
  viewDashboard,
  filterOrdersByDate,
  loadadminProducts,
};
