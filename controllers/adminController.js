const User = require("../models/userModel");
const authRoutes = require("../services/authRoutes");
const bcrypt = require("bcrypt");
const Order = require("../models/ordersModel");
const Product = require("../models/productModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const blobStream = require("blob-stream");
const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");








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
    const orders = await Order.find()
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
      });



    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.orderTotal,
      0
    );

    const totalOrders = orders.length;

    const totalProducts = await Product.countDocuments();

  

    res.render("dashboard", {
      orders,
      totalRevenue,
      totalOrders,
      totalProducts,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};



const downloadExel=async(req,res)=>{
  try {
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    
    worksheet.addRow([
      "Order ID",
      "User Name",
      "Date",
      "Total",
      "Coupon Applied",
      "Payment Method",
      "Discount",
    ]);

    const orders = await Order.find()
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
      });

    orders.forEach((order) => {
      worksheet.addRow([
        order._id,
        order.user.name,
        order.orderDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        order.orderTotal.toFixed(1),
        order.couponApplied ? order.couponApplied.code : "Not Applied",
        order.PaymentMethod,
        order.discountPercentage
          ? `${order.discountPercentage}%`
          : "No discount",
      ]);
    });

    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
}










const downloadPDF = async (req, res) => {
  try {
    const orders = await Order.find()
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
      });

    const doc = new PDFDocument();

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add table headers
    doc.fontSize(12).text("Order ID", 20, 20);
    doc.fontSize(12).text("User Name", 120, 20);
    doc.fontSize(12).text("Date", 220, 20);
    doc.fontSize(12).text("Total", 320, 20);
    doc.fontSize(12).text("Coupon Applied", 420, 20);
    doc.fontSize(12).text("Payment Method", 520, 20);
    doc.fontSize(12).text("Discount", 620, 20);

    let y = 40;
    const lineHeight = 20; // Adjust this value to change spacing

    // Add order data rows
    orders.forEach((order, index) => {
      y += lineHeight;
      doc.fontSize(10).text(`#${order._id}`, 20, y);
      doc.fontSize(10).text(order.user.name, 120, y);
      doc
        .fontSize(10)
        .text(
          order.orderDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          220,
          y
        );
      doc.fontSize(10).text(`Rs: ${order.orderTotal.toFixed(1)}`, 320, y);

      if (order.couponApplied) {
        doc.fontSize(10).text(order.couponApplied.code, 420, y);
      } else {
        doc.fontSize(10).text("Not Applied", 420, y);
      }

      if (order.PaymentMethod === "COD") {
        doc.fontSize(10).text("COD", 520, y);
      } else if (order.PaymentMethod === "RazorPay") {
        doc.fontSize(10).text("RazorPay", 520, y);
      }

      if (order.discountPercentage) {
        doc.fontSize(10).text(`${order.discountPercentage}%`, 620, y);
      } else {
        doc.fontSize(10).text("No discount", 620, y);
      }
    });

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  loadAdminLog,
  adminLogin,
  adminLogout,
  viewDashboard,
  downloadExel,
  downloadPDF,
};
