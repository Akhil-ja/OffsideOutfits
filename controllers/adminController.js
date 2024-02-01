    const User = require("../models/userModel");
    const Product=require("../models/productModel");

const bcrypt = require("bcrypt");

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

     const allProducts = await Product.find();
        res.render("products", { allProducts });
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

   

    const viewCategory = async (req, res) => {
      try {
        res.render("category");
      } catch (error) {
        console.log(error.message);
      }
    };


    const add_User = async (req, res) => {
      try {

         const spassword = await securePassword(req.body.password);
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.mobile,
          password: spassword,
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



const edit_User = async (req, res) => {
  try {
    // Extract the user ID from the query parameter
    const id = req.query.id;

    // Update the user details based on the data in req.body
    const updatedUser = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      password: req.body.password,
      address: req.body.address,
      is_verified: req.body.verified,
      is_active: req.body.status,
    });

    // Redirect to the user details page or render a success message
    res.redirect(`/admin/users`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};



const delete_User = async (req, res) => {
  try {
    const id = req.query.id;

    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    // Redirect to the user list page or render a success message
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const add_Product = async (req, res) => {
  try {
    const images = req.files.map((file) => file.filename);

    const newProduct = new Product({
      pname: req.body.ProductName,
      price: req.body.ProductPrice,
      description: req.body.ProductDetails,
      sizes: req.body.pname,
      category: req.body.productCategory,
      is_listed: req.body.listed,
      brand: req.body.ProductBrand,
      images: images
    });

    
    await newProduct.save();
    console.log(newProduct);
    
  

    res.redirect("/admin/products");

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
        
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product by ID and remove it
    const result = await Product.deleteOne({_id:productId});

    if (result) {
      res.redirect("/admin/products");
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    res.render("editProduct", { product });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



 





 const edit_product=async (req, res) => {
    try {
      // Extract the user ID from the query parameter
      const id = req.query.id;
     

      // Update the user details based on the data in req.body
      const updatedProduct = await Product.findByIdAndUpdate(id, {
        pname: req.body.ProductName,
        price: req.body.ProductPrice,
        description: req.body.ProductDetails,
        sizes: req.body.pname,
        category: req.body.productCategory,
        is_listed: req.body.listed,
        brand: req.body.ProductBrand,
        images: req.body.ProductImages,
      });

      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
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
      edit_User,
      delete_User,
      add_Product,
      deleteProduct,
      edit_product,
    };