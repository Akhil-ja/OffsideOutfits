const User = require("../models/userModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/sendEmail");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../services/generateOTP");
const { body, validationResult } = require("express-validator");

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

   const validateSignup = [
     body("fullname").trim().notEmpty().withMessage("Full name is required"),
     body("email").trim().isEmail().withMessage("Invalid email address"),
     body("phone").trim().isMobilePhone().withMessage("Invalid phone number"), // Assuming you want to validate as a mobile phone number

     (req, res, next) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         // If there are validation errors, return response with 400 status and error messages
         return res.status(400).json({ errors: errors.array() });
       }
       next();
     },
   ];


    if (req.session.tempUserDetails) {
      const subject = "Welcome to YourApp";
      console.log(randomCode);
      const text = `Your verification code is: ${randomCode}`;
      await sendEmail(req.body.email, subject, text);
      console.log(req.session.tempUserDetails);
      res.render("OTPpage", { errorMessage:null });
    } else {
      console.log("Registration not successful");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    let errorMessage = ""; // Declare errorMessage variable

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
      
    

    res.render("OTPpage", { errorMessage:"Not valid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};



const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === "0") {
          res.render("loginRegister", {
            errorMessage: "Account not verified yet.",
          });
        } else {
          res.redirect("/home");
        }
      } else {
        res.render("loginRegister", { errorMessage: "Incorrect password." });
      }
    } else {
      res.render("loginRegister", { errorMessage: "User does not exist." });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadHome = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products,errorMessage:" " });
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
