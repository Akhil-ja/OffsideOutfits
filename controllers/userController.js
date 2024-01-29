const User = require("../models/userModel");

const bcrypt = require("bcrypt");

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

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.render("loginRegister");
      console.log("registration Success!");
      console.log(req.body.fullname);
    } else console.log("Registratin not success");
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
        if (userData.is_verified === 0) {
          // Redirect to the registration page if not verified
          res.render("register");
        } else {
          // Redirect to the home page if verified
          res.redirect("/home");
        }
      } else {
        // Redirect to the registration page if password doesn't match
        res.render("register");
      }
    } else {
      // Redirect to the registration page if user not found
      res.render("register");
    }
  } catch (error) {
    console.log(error.message);
    // Handle other errors if needed
    res.render("errorPage"); // Render an error page or handle it as appropriate
  }
};


const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadlogin,
  insertUser,
  loadHome,
  verifyLogin,
};
