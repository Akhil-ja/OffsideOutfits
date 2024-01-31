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

  const loadUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.render("users", { users });
    } catch (error) {
      console.log(error.message);
    }
  };

 

    const addUser=async(req,res)=>{
      try {
        res.render("addUser")
      } catch (error) {
       console.log(error.message);
      }
    }

    const addProduct = async (req, res) => {
      try {
        res.render("addProduct");
      } catch (error) {
        console.log(error.message);
      }
    };

    const editProduct = async (req, res) => {
      try {
        res.render("editProduct");
      } catch (error) {
        console.log(error.message);
      }
    };

    const viewCategory = async (req, res) => {
      try {
        res.render("category");
      } catch (error) {
        console.log(error.message);
      }
    };


    const add_User = async (req, res) => {
      try {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.mobile,
          password: req.body.password,
          is_admin: 0,
          is_verified: req.body.verified,
          address: req.body.address,
          is_active: req.body.status,
        });
        const savedUser = await newUser.save();
       res.redirect("/admin/users");
      } catch (error) {
        console.log(error.message);
      }
    };
  
    const editUser = async (req, res) => {
      try {
        const id = req.query.id;

        if (!id) {
          return res.status(400).send("User ID is missing in the request.");
        }

        const userDetails = await User.findById(id);

        if (!userDetails) {
          return res.status(404).send("User not found.");
        }

        res.render("editUser", { userDetails });
      } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      }
    };





    module.exports = {
      loadAdminLog,
      loadDashboard,
      loadProducts,
      loadUsers,
      editUser,
      addUser,
      addProduct,
      editProduct,
      viewCategory,
      add_User,
      
    };