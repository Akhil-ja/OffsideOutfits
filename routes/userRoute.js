

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const addressController = require("../controllers/addressController");
const authRoutes=require("../services/authRoutes")

const express = require("express");


const userRoute = express();

userRoute.use(express.urlencoded({ extended: true }));

userRoute.set("view engine", "ejs");





userRoute.set("views","./views/User");

userRoute.get("*", authRoutes.checkUser);



userRoute.get("/register", userController.loadlogin)
.post("/login", userController.verifyLogin)
.post("/register", userController.initialSignUp)

userRoute.post("/verify-otp", userController.insertUser);
userRoute.get("/resend-otp", userController.resentOTP);



userRoute.use(authRoutes.isBlocked);

userRoute.get(
  "/home",
  authRoutes.checkUser,
  authRoutes.isLogin,
  userController.loadHome
);


userRoute.get(
  "/products",
  authRoutes.isBlocked,
  authRoutes.isLogin,
  productController.loadProducts
);

userRoute.get("/cart", authRoutes.isLogin, cartController.loadCart);

userRoute.get(
  "/products/:productId",
  authRoutes.isLogin,
  productController.loadProduct
);

userRoute.get("/checkOut", authRoutes.isLogin, cartController.loadCheckout);

userRoute.get("/profile", authRoutes.isLogin, userController.loadProfile);

userRoute.get("/logout", userController.userLogout);


userRoute.get("/add-address",authRoutes.isLogin, addressController.addAddress);
userRoute.post("/add-address",authRoutes.isLogin, addressController.add_Address);


userRoute.get(
  "/edit-address?:addressId",
  authRoutes.isLogin,
  addressController.editAddress
);


userRoute.post("/edit-address", authRoutes.isLogin, addressController.edit_Address);
userRoute.post("/set-default-address/:addressId", addressController.setDefault);




userRoute.post("/add-to-cart", cartController.addToCart);



userRoute.post("/update-cart-quantity",cartController.cartQuantity);
userRoute.post("/remove-from-cart", cartController.cartRemove);



userRoute.post("/place-order", orderController.createOrders);



userRoute.get(
  "/order-details",
  authRoutes.isLogin,
  orderController.getOrderDetails
);


userRoute.get("/add-delete",addressController.deleteAddress);

userRoute.post(
  "/change-password",
  userController.changePassword
);

userRoute.post("/edit-user",userController.editUserDetails)


module.exports= userRoute;