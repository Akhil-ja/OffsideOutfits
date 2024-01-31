    const User = require("../models/userModel");

    const loadAdminLog = async (req, res) => {
      try {
        res.render("login");
      } catch (error) {
        console.log(error.message);
      }
    };

    const loadDashboard=async(req,res)=>{
      try {
        res.render("dashboard")
      } catch (error) {
        console.log(error.message);
      }
    }

    const loadProducts=async(req,res)=>{
      try {
        res.render("products")
      } catch (error) {
        error.message
      }
    }

    const loadUsers=async(req,res)=>{
      try {
        res.render("users")
      } catch (error) {
        error.message
      }
    }

    module.exports = {
      loadAdminLog,
      loadDashboard,
      loadProducts,
      loadUsers,
    };