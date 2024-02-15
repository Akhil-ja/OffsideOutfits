const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address=require("../models/addressModel")


const sendEmail = require("../services/sendEmail");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../services/generateOTP");
const authRoutes=require("../services/authRoutes")



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
     res.cookie("jwt", "", { maxAge: 1 });
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

    //  const emailExists = await User.findOne({ email: req.body.email });
    //  const phoneExists = await User.findOne({ phone: req.body.phone });

    //  if (emailExists || phoneExists) {
    //    // User with the same email or phone number already exists
    //    const errorMessage =
    //      "User with the same email or phone number already exists.";
    //    res.render("loginRegister", { errorMessage });
    //    return;
    //  }

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
      res.render("OTPpage", { errorMessage: null });
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
    
      const user = new User({
        name: req.session.tempUserDetails.fullname,
        email: req.session.tempUserDetails.email,
        phone: req.session.tempUserDetails.phone,
        password: req.session.tempUserDetails.password,
        is_admin: 0,
        is_verified: 1,
      });

      const userData = await user.save();
      const userID=userData._id;
      const token = authRoutes.createToken(userID);
      res.cookie("jwt", token,{httpOnly:true,maxAge:authRoutes.maxAge*1000});
      console.log(token);
      
      

     

      res.redirect("/home");
    } else {
      res.render("OTPpage", { errorMessage: "Not valid OTP" });
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
                 // creating Token
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


const loadCart = async (req, res) => {
  try {
        res.render("cart")
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const loadCheckout=async(req,res)=>{
  try {
    res.render("checkout")
  } catch (error) {
    console.log(error.message);
  }
}

const loadProfile = async (req, res) => {
  try {
    const selectedValue = req.query.selected;
    console.log(selectedValue);
    const userId = res.locals.currentUser._id.toString();


    
    const matchingAddress = await Address.findOne({ user: userId }).exec();
   

    if (!matchingAddress) {
      console.error("Address not found for user:", userId);
      return res.status(404).send("Address not found for user");
    }

    let pageinfo = selectedValue;
    res.render("profile", { pageinfo, matchingAddress });
  } catch (error) {
    console.log(error.message);
  }
};






const userLogout=async(req,res)=>{
  try {
     res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/register")
  } catch (error) {
    console.log(error.message);
  }
}




const addAddress=async(req,res)=>{
  try {
    
    res.render("addAddress");
  } catch (error) {
     console.log(error.message);
  }
}


const add_Address = async (req, res, next) => {
  try {
    console.log("Hi");
    const { type, AddName, House, street, state, city, PIN } = req.body;

    const newAddress = {
      AddName,
      House,
      street,
      state,
      city,
      PIN,
      type,
    };

    const existingAddress = await Address.findOne({ user: req.body.userID });

    if (existingAddress) {
      if (existingAddress.address.length >= 4) {
        return res.redirect("/profile?selected=AddressSize");
      }

      existingAddress.address.push(newAddress);
      await existingAddress.save();
      return res.redirect("/profile?selected=Address");
    } else {
      const address = new Address({
        user: req.body.userID,
        address: [newAddress],
      });

      await address.save();
    }

    let pageinfo = "Address";
    res.render("profile", { pageinfo });
  } catch (error) {
    console.log(error.message);
  }
};




const editAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    console.log("object_id:"+addressId);
    const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );

console.log("Address======"+addressDetails);
  

    if (!addressDetails) {
      console.error("Address not found for ID:", addressId);
      return res.status(404).send("Address not found for ID");
    }

    res.render("editAddress", { addressDetails });
  } catch (error) {
    console.log(error.message);
  }
};





const edit_Address = async (req, res) =>  {

try {
        const addressId = req.query.addressId; 
        const updatedAddressData = req.body; 
        console.log("updated"+updatedAddressData);

        
        const result = await Address.findOneAndUpdate(
          { "address._id": addressId },
          { $set: { "address.$": updatedAddressData } },
          { new: true }
        );

        if (!result) {
            console.log("Address not found or not updated");
            
        }

        res.redirect("/profile?selected=Address");
    } catch (error) {
        console.log(error.message);
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
  loadCart,
  loadCheckout,
  loadProfile,
  userLogout,
  addAddress,
  add_Address,
  editAddress,
  edit_Address,
};
