const User = require("../models/userModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/sendEmail");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../services/generateOTP");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadlogin = async (req, res) => {
  try {
    res.render("loginRegister");
  } catch (error) {
    console.log(error.message);
  }
};

const generateRandomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random number between 1000 and 9999 as a string
};

const initialSignUp = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const randomCode = generateRandomCode();

    req.session.tempUserDetails = {
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: spassword,
      is_admin: 0,
      is_verified: 0,
      otp: randomCode, // Store the generated OTP in the session
    };

    if (req.session.tempUserDetails) {
      const subject = "Welcome to YourApp";
      console.log(randomCode);
      const text = `Your verification code is: ${randomCode}`;
      await sendEmail(req.body.email, subject, text);
      console.log(req.session.tempUserDetails);
      res.render("OTPpage");
    } else {
      console.log("Registration not successful");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    if (req.body.otp === req.session.tempUserDetails.otp) {
      const spassword = await securePassword(
        req.session.tempUserDetails.password
      );

      const user = new User({
        name: req.session.tempUserDetails.fullname,
        email: req.session.tempUserDetails.email,
        phone: req.session.tempUserDetails.phone,
        password: spassword,
        is_admin: 0,
        is_verified: 0,
      });

      const userData = await user.save();

      res.redirect("/home");
    } else {
      console.log("Invalid OTP");
      // Handle the case where OTP is invalid
      res.redirect("/invalid-otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Find the user based on the provided email
    const userData = await User.findOne({ email: email });

    if (userData) {
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        // Check if the user is verified
        if (userData.is_verified === "0") {
          // Redirect to the registration page if not verified
          res.render("loginRegister");
        } else {
          // Redirect to the home page if verified
          res.redirect("/home");
        }
      } else {
        // Redirect to the registration page if password doesn't match
        res.render("loginRegister");
      }
    } else {
      // Redirect to the registration page if user not found
      res.render("loginRegister");
    }
  } catch (error) {
    console.log(error.message);
    // Handle other errors if needed
    res.render("errorPage"); // Render an error page or handle it as appropriate
  }
};

const loadHome = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (error) {
    console.log(error.message);
  }
};

const loadCategory = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products", { products });
  } catch (error) {
    error.message;
  }
};

const loadProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("ViewProduct", { product });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  loadlogin,
  insertUser,
  loadHome,
  verifyLogin,
  loadCategory,
  loadProduct,
  initialSignUp,
};
