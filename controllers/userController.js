const User = require("../models/userModel");
const Product = require("../models/productModel");
const Orders = require("../models/ordersModel");
const Address = require("../models/addressModel");
const sendEmail = require("../services/sendEmail");
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

const loadlogin = async (req, res) => {
  try {
    const jwtCookie = req.cookies.jwt;
    if (jwtCookie) {
      return res.redirect("/home");
    }
    return res.render("loginRegister", {
      errorMessage: null,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const generateRandomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); 

}

 const otpNull = (req, res) => {
   setInterval(() => {
     req.session.tempUserDetails.otp = null;
     req.session.save();
     console.log("OTP null");
   }, 60*1000*5);
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
      otp: randomCode,
    };

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      
      return res.render("loginRegister", {
        errorMessage: "Email already exists. Please use a different email.",
      });
    }

    req.session.save();
    if (req.session.tempUserDetails) {
      const subject = "Welcome to Offside Outfits";
      console.log("OTP:" + randomCode);
      const text = `Your verification code is: ${randomCode}`;
      await sendEmail(req.body.email, subject, text);
       otpNull(req, res);
      console.log(req.session.tempUserDetails);
      res.render("OTPpage", { errorMessage: null });
      res.cookie("jwt", "", { maxAge: 1 });
    } else {
      console.log("Registration not successful");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const resentOTP = async (req, res) => {
  const randomCode = generateRandomCode();

  req.session.tempUserDetails.otp = randomCode;
  req.session.save();

  const subject = "Welcome to Offside Outfits";
  console.log("New OTP:" + randomCode);
  const text = `Your verification code is: ${randomCode}`;
  await sendEmail(req.session.tempUserDetails.email, subject, text);
    otpNull(req, res);
  console.log(req.session.tempUserDetails);
};



const insertUser = async (req, res) => {
  try {
    if (req.body.otp === req.session.tempUserDetails.otp) {
      const user = new User({
        name: req.session.tempUserDetails.fullname,
        email: req.session.tempUserDetails.email,
        phone: req.session.tempUserDetails.phone,
        password: req.session.tempUserDetails.password,
        is_admin: 0,
        is_verified: 1,
      });

      const userData = await user.save();
      const userID = userData._id;
      const token = authRoutes.createToken(userID);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: authRoutes.maxAge * 1000,
      });
      console.log(token);
      res.redirect("/home");
    } else {
      res.render("OTPpage", { errorMessage: "Not valid OTP" });
      res.cookie("jwt", "", { maxAge: 1 });
    }
  } catch (error) {
    console.log(error.message);
  }
};



const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_active === "0") {
          res.status(200).json({ errorMessage: "Account is Blocked" });
        } else {
          const userID = userData._id;
          console.log(userData.name);

          const token = authRoutes.createToken(userID);

          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: authRoutes.maxAge * 1000,
          });
          

          res.status(200).json({ success: true });
        }
      } else {
        res.status(200).json({ errorMessage: "Incorrect password." });
      }
    } else {
      res.status(200).json({ errorMessage: "User does not exist." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ errorMessage: "Internal server error." });
  }
};




const loadHome = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products, errorMessage: " " });
  } catch (error) {
    console.log(error.message);
  }
};



const userLogout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/register");
  } catch (error) {
    console.log(error.message);
  }
};



const loadProfile = async (req, res) => {
  try {
    const selectedValue = req.query.selected;
  
    const userID = res.locals.currentUser._id;

    const userDetails = await User.findOne({ _id: userID });

    const matchingAddress = await Address.findOne({ user: userID });

    let pageinfo = selectedValue;

    console.log(userID);

    const AllOrders = await Orders.find({ user: userID })
      .populate({
        path: "products.product",
        model: "Product",
      })
      .sort({ orderDate: -1 })
      .exec();

    if (!matchingAddress) {
  console.error("Address not found for user:", userID);
}

res.render("profile", {
  pageinfo,
  matchingAddress,
  AllOrders,
  userDetails,
});

    
  } catch (error) {
    console.log(error.message);
  }
};




// ***********Admin****************



const edit_User = async (req, res) => {
  try {
    const id = req.query.id;
    const existingUser = await User.findById(id);

   

    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    const updatedUser = await User.findByIdAndUpdate(id, {
      is_verified: req.body.verified,
      is_active: req.body.status,
    });

    res.redirect(`/admin/users`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
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

    res.render("editUser", { userDetails, errorMessage: null });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const loadUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render("users", { users });
  } catch (error) {
    console.log(error.message);
  }
};




const changePassword = async (req, res) => {
  try {
    const { userID, oldPassword, newPassword, confirmNewPassword } = req.body;

    console.log("User ID:", userID);
    console.log("Old Password:", oldPassword);
    console.log("New Password:", newPassword);
    console.log("Confirm New Password:", confirmNewPassword);

    
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        errorMessage: "New password and confirm password do not match.",
      });
    }

   
    if (oldPassword === newPassword) {
      return res.status(400).json({
        errorMessage: "New password must be different from the old password.",
      });
    }

    const currentUser = await User.findById(userID);

    const passwordMatch = await bcrypt.compare(
      oldPassword,
      currentUser.password
    );

    if (passwordMatch) {
      const newHashedPassword = await securePassword(newPassword);
      currentUser.password = newHashedPassword;
      await currentUser.save();

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ errorMessage: "Old password is incorrect." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ errorMessage: "Internal server error." });
  }
};


const editUserDetails = async (req, res) => {
  try {
    console.log("in edit user details");
    const { userID, name, phone } = req.body;
    

    try {
      const user = await User.findById(userID);
      user.name = name;
      user.phone = phone; 
      await user.save();

      res.status(200).send("Profile updated");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
};





module.exports = {
  loadlogin,
  insertUser,
  loadHome,
  verifyLogin,
  resentOTP,
  initialSignUp,
  loadProfile,
  userLogout,
  loadUsers,
  editUser,
  edit_User,
  changePassword,
  editUserDetails,
};
