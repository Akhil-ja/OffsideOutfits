const User = require("../models/userModel");
const Product = require("../models/productModel");
const Orders = require("../models/ordersModel");
const Address = require("../models/addressModel");
const Wallet = require("../models/walletModel");
const sendEmail = require("../services/sendEmail");
const authRoutes = require("../services/authRoutes");
const crypto = require("crypto");
const ReferralCode = require("../models/referalCodeModel");
const bcrypt = require("bcrypt");
const { log } = require("console");


const generateRandomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

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




 const otpNull = (req, res) => {
   setInterval(() => {
     req.session.tempUserDetails.otp = null;
     req.session.save();
   
   }, 60*1000*5);
 };

    
const initialSignUp = async (req, res) => {
  try {

   
    const referralCode = req.body.referralCode;

       let referredUser = null;


    if (referralCode) {
       referredUser = await User.findOne(
        { referralCode: referralCode },
       
      );

       if (referredUser) {
         console.log("Referral code is valid");
       } else {
        
         return res.render("loginRegister", {
           errorMessage:
             "Referral code is invalid.",
         });
       } 
      
      referredUser = referredUser._id;



    
    }

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
      referalUserID:referredUser
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
   
      const text = `Your verification code is: ${randomCode}`;
      await sendEmail(req.body.email, subject, text);
      otpNull(req, res);
    
      res.render("OTPpage", { errorMessage: null });
      res.cookie("jwt", "", { maxAge: 1 });
    } else {
  
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
 
  const text = `Your verification code is: ${randomCode}`;
  await sendEmail(req.session.tempUserDetails.email, subject, text);
    otpNull(req, res);

};



const insertUser = async (req, res) => {
  try {
    if (req.body.otp === req.session.tempUserDetails.otp) {
      const referralCode = crypto.randomBytes(3).toString("hex");
      const user = new User({
        name: req.session.tempUserDetails.fullname,
        email: req.session.tempUserDetails.email,
        phone: req.session.tempUserDetails.phone,
        password: req.session.tempUserDetails.password,
        is_admin: 0,
        is_verified: 1,
        referralCode: referralCode,
      });
      const userData = await user.save();
      const userID = userData._id;

      // Check if a referral code was provided during registration
      if (req.session.tempUserDetails.referalUserID) {
        const referral = await ReferralCode.findOne({
          code: req.session.tempUserDetails.referralCode,
        });
        if (referral) {
          const referredUserReward = referral.referredUserReward;
          const referringUserReward = referral.referringUserReward;

          // Add referral reward to the referred user's wallet
          let referredUserwallet = await Wallet.findOne({
            user: req.session.tempUserDetails.referalUserID,
          });
          if (!referredUserwallet) {
            referredUserwallet = new Wallet({
              user: req.session.tempUserDetails.referalUserID,
              money: parseFloat(referredUserReward),
              transactions: [
                {
                  amount: parseFloat(referredUserReward),
                  type: "Referal",
                },
              ],
            });
          } else {
            referredUserwallet.money += parseFloat(referredUserReward);
            referredUserwallet.transactions.push({
              amount: parseFloat(referredUserReward),
              type: "Referal",
            });
          }
          await referredUserwallet.save();

          // Add referral reward to the new user's wallet
          let userWallet = await Wallet.findOne({ user: userID });
          if (!userWallet) {
            userWallet = new Wallet({
              user: userID,
              money: parseFloat(referringUserReward),
              transactions: [
                {
                  amount: parseFloat(referringUserReward),
                  type: "Referal Amount",
                },
              ],
            });
          } else {
            userWallet.money += parseFloat(referringUserReward);
            userWallet.transactions.push({
              amount: parseFloat(referringUserReward),
              type: "Referal Amount",
            });
          }
          await userWallet.save();
        }
      }

      const token = authRoutes.createToken(userID);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: authRoutes.maxAge * 1000,
      });
      res.redirect("/home");
    } else {
      res.render("OTPpage", { errorMessage: "Not valid OTP" });
      res.cookie("jwt", "", { maxAge: 1 });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
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
    const walletDetails = await Wallet.findOne({ user: userID })
      .populate({
        path: "transactions",
        options: { sort: { createdAt: -1 } },
      })
      .exec();

    let pageinfo = selectedValue;
  

    
    const page = parseInt(req.query.page) || 1; 
    const perPage = 5; 

   
    const AllOrders = await Orders.find({ user: userID })
      .populate({ path: "products.product", model: "Product" })
      .sort({ orderDate: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const orderCount = await Orders.countDocuments({ user: userID });

    if (!matchingAddress) {
      console.error("Address not found for user:", userID);
    }

   
    const totalPages = Math.ceil(orderCount / perPage);

    res.render("profile", {
      pageinfo,
      matchingAddress,
      AllOrders,
      userDetails,
      walletDetails,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const viewforgotPassword=async(req,res)=>{
  try {
 const jwtCookie = req.cookies.jwt;
 if (jwtCookie) {
   return res.redirect("/home");
 } 
      res.render("forgotPasssword");
  } catch (error) {
    
  }
}


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
    
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;

    
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    
    const visiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

   
    const skipCount = (currentPage - 1) * itemsPerPage;

    
    const users = await User.find().skip(skipCount).limit(itemsPerPage);

    
    res.render("users", {
      users,
      currentPage,
      totalPages,
      startPage,
      endPage,
    });
  } catch (error) {
    
    console.error("Error loading users:", error.message);
   
  }
};





const changePassword = async (req, res) => {
  try {
    const { userID, oldPassword, newPassword, confirmNewPassword } = req.body;


    
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


const sendMailForgotPassword=async(req,res)=>{
  try {

     const jwtCookie = req.cookies.jwt;
     if (jwtCookie) {
       return res.redirect("/home");
     } 

    const {email}=req.body;
    console.log("email:" + email);

    const user = await User.findOne({ email: email });

     req.session.forgotPasswordUser = user._id;


    console.log("user:" + user);

    if (!user) {
      return res.render("loginRegister", {
        errorMessage: "User Does not exists. Please register.",
      });
    }

    const otp= await generateRandomCode();

     console.log("OTP:" + otp);

     req.session.forgotPasswordOTP = otp;

     console.log("OTP stored in session:", otp);

    const subject = "This is the code for Verifying Email";
   
    const text = `Your verification code is: ${otp}`;

    await sendEmail(email, subject, text);

    res.render("forgotPasswordOTP");


  } catch (error) {
     console.error(error.message);
  }
}


const verifyForgotOTP = async (req, res) => {
  try {

     const jwtCookie = req.cookies.jwt;
     if (jwtCookie) {
       return res.redirect("/home");
     } 

    const { otp } = req.body;

   
    const forgotPasswordOTP = req.session.forgotPasswordOTP;

      if (otp === forgotPasswordOTP) {
     
      res.status(200).send("Success");
    } else {
    
      res.status(400).send("OTP is not correct");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};



const viewChangePassword=async(req,res)=>{
  try {
   const jwtCookie = req.cookies.jwt;
   if (jwtCookie) {
     return res.redirect("/home");
   } 
    res.render("ChangePassword");
  } catch (error) {
    console.error(error.message);
  }
}

const ChangeForgotPassword = async (req, res) => {
  try {
    console.log("in Change Password");
    const { newPassword } = req.body;

    const userID = req.session.forgotPasswordUser;

    const user = await User.findOne({ _id: userID });

    const spassword = await securePassword(newPassword);
    user.password = spassword;
    await user.save();

    const token = authRoutes.createToken(userID);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: authRoutes.maxAge * 1000,
    });
    res.redirect("/home");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const resendForgotOTP = async (req, res) => {
  try {
    const userID = req.session.forgotPasswordUser;
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const email = user.email;
    const otp = await generateRandomCode();
    req.session.forgotPasswordOTP = otp;
   
    const subject = "This is the code for Verifying Email";
    const text = `Your verification code is: ${otp}`;
    await sendEmail(email, subject, text);


    return res.status(200).end(); 

    
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal server error" });
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
  sendMailForgotPassword,
  viewforgotPassword,
  verifyForgotOTP,
  viewChangePassword,
  ChangeForgotPassword,
  resendForgotOTP,
};
