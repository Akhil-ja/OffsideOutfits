const User = require("../models/userModel");
const authRoutes = require("../services/authRoutes");
const bcrypt = require("bcrypt");
const Order = require("../models/ordersModel");
const Product = require("../models/productModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");





const Category=require("../models/categoryModel");
const ordersModel = require("../models/ordersModel");






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
  

  const jwtCookie = req.cookies.jwt;
  if (jwtCookie) {
    return res.redirect("/admin/dashboard");
  }
  
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




const viewsalesReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const sortedOrders = await Order.find({ status: "delivered" })
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

    res.render("salesReport", {
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

const updateProductPriceAfterDiscount = async () => {
  try {
    const products = await Product.find();
console.log("updateProductPriceAfterDiscount");
    for (const product of products) {
      const discountedPrice =
        product.price - (product.price * product.discountPercentage) / 100;
      product.priceAfterDiscount = discountedPrice;
      await product.save();
    }
  } catch (error) {
    console.error("Error updating product priceAfterDiscount:", error);
  }
};

const loadAdminProducts = async (req, res) => {
  try {
console.log("loadAdminProducts");
    updateProductPriceAfterDiscount();
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;

    const totalProducts = await Product.countDocuments();

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const visiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    const skipCount = (currentPage - 1) * itemsPerPage;

 const products = await Product.find()
   .populate("category")
   .sort({ createdAt: -1 })
   .skip(skipCount)
   .limit(itemsPerPage);


    

    res.render("products", {
      products,
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
      let query = { status: "delivered" };
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

const editproductImagePOST = async (req, res) => {
  try {

    console.log("hello in image edit");
    console.log(req.file);
    const image = req.body.imagename;
    const index = parseInt(req.body.index);
    const productID = req.body.productID;
    console.log(image, index, productID);

    if (image) {
      const productDetails = await Product.findOne({ _id: productID });
      console.log(productDetails.images);
      productDetails.images.splice(index, 1, image);
      console.log(productDetails.images);
      await productDetails.save();
      console.log(productDetails.images);
      res.json({ status: "okay" });
    } else {
      res.json({ status: "oops" });
    }
  } catch (error) {
    console.log(error);
  }
};


const viewDashboard = async (req, res) => {
  try {
    let daily = await salesReport(1);
    let weekly = await salesReport(7);
    let monthly = await salesReport(30);
    let yearly = await salesReport(365);
    let orderChart = await orderPieChart();
    let allProductsCount = await Product.countDocuments();

    const orders = await ordersModel.find();
    const totalRevenue = await calculateTotalRevenue(orders);
    const totalOrders = orders.length;
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.find().count();

    const topProducts = await Product.find().sort({ popularity: -1 }).limit(10);

    const topCategories = await Product.aggregate([
      { $sort: { popularity: -1 } }, 
      { $limit: 10 }, 
      {
        $group: {
          _id: "$category", 
          totalPopularity: { $sum: "$popularity" }, 
        },
      },
      { $sort: { totalPopularity: -1 } }, 
    ]);

    const categoryIds = topCategories.map((category) => category._id);

    const categoryMap = new Map();
    const categories = await Category.find({ _id: { $in: categoryIds } });

    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category);
    });

    const sortedCategories = topCategories.map((category) =>
      categoryMap.get(category._id.toString())
    );

    
    const topBrands = await Product.aggregate([
      {
        $group: {
          _id: "$brand", 
          totalPopularity: { $sum: "$popularity" }, 
        },
      },
      { $sort: { totalPopularity: -1 } }, 
      { $limit: 10 }, 
    ]);

    

    res.render("dashboard", {
      daily,
      weekly,
      monthly,
      yearly,
      allProductsCount,
      orderChart,
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCategories,
      topProducts,
      topCategories: sortedCategories,
      topBrands,
    });
  } catch (error) {
    console.error("Error in viewDashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};



async function calculateTotalRevenue() {
  try {
  
    const orders = await ordersModel.find();
    let totalRevenue = 0;
    orders.forEach((order) => {
      totalRevenue += order.orderTotal;
    });
    return totalRevenue.toFixed(2);
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    throw error;
  }
}

async function orderPieChart() {
  const statuses = [
    "pending",
    "completed",
    "returned",
    "cancelled",
    "delivered",
    "payment failed",
  ];

  const counts = await Promise.all(
    statuses.map((status) => ordersModel.countDocuments({ status }))
  );

  return { statuses, counts };
}


async function salesReport(date) {
  try {
    const currentDate = new Date();
    let startDate, endDate;

    if (date === 1) {
      
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const orders = await ordersModel.find({
      status: "delivered",
      orderDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const labels = [];
    const data = [];

    for (let i = 0; i < date; i++) {
      const dateLabel = new Date(startDate);
      dateLabel.setDate(startDate.getDate() + i);
      labels.push(dateLabel.toLocaleDateString());

      const dailyOrders = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return (
          orderDate.getFullYear() === dateLabel.getFullYear() &&
          orderDate.getMonth() === dateLabel.getMonth() &&
          orderDate.getDate() === dateLabel.getDate()
        );
      });

      const dailyRevenue = dailyOrders.reduce(
        (total, order) => total + order.orderTotal,
        0
      );

      data.push(dailyRevenue);
    }

    return { labels, data };
  } catch (err) {
    console.log("Error in sales report:", err.message);
    throw err;
  }
}

module.exports = {
  loadAdminLog,
  adminLogin,
  adminLogout,
  viewsalesReport,
  viewDashboard,
  filterOrdersByDate,
  loadAdminProducts,
  editproductImagePOST,
};
