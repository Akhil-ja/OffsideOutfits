const User = require("../models/userModel");
const authRoutes = require("../services/authRoutes");
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


module.exports = {
  loadAdminLog,
  adminLogin,
  adminLogout,
};
