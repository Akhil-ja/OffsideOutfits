

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const addressController = require("../controllers/addressController");
const couponController=require("../controllers/couponController")
const authRoutes=require("../services/authRoutes")
const walletController=require("../controllers/walletController")
const wishlistController=require("../controllers/wishlistController")






const express = require("express");

const userRoute = express();

userRoute.use(express.urlencoded({ extended: true }));

userRoute.set("view engine", "ejs");





userRoute.set("views","./views/User");

userRoute.use(authRoutes.checkUser);



userRoute.get("/register", userController.loadlogin)
.post("/login", userController.verifyLogin)
.post("/register", userController.initialSignUp)

userRoute.post("/verify-otp", userController.insertUser);
userRoute.get("/resend-otp", userController.resentOTP);

userRoute.get("/forgot-Password", userController.viewforgotPassword);

userRoute.post("/forgot-password-mail", userController.sendMailForgotPassword);

userRoute.post("/verify-forgot-otp", userController.verifyForgotOTP);

userRoute.get("/change-forgot-password", userController.viewChangePassword);

userRoute.post("/change-forgot-password", userController.ChangeForgotPassword);

userRoute.get("/resend-forgot-otp", userController.resendForgotOTP);




userRoute.use(authRoutes.isBlocked);

userRoute.get(
  "/home",
  authRoutes.isBlocked,
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

userRoute.get(
  "/products/sort",
  authRoutes.isBlocked,
  authRoutes.isLogin,
  productController.loadProducts
);

userRoute.get(
  "/cart",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  cartController.loadCart
);

userRoute.get(
  "/products/:productId",
  authRoutes.isLogin,
  productController.loadProduct
);

userRoute.get(
  "/checkOut",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  cartController.loadCheckout
);

userRoute.get(
  "/profile",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  userController.loadProfile
);

userRoute.get("/logout", userController.userLogout);


userRoute.get(
  "/add-address",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  addressController.addAddress
);

userRoute.post(
  "/add-address",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  addressController.add_Address
);


userRoute.get(
  "/edit-address?:addressId",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  addressController.editAddress
);


userRoute.post(
  "/edit-address",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  addressController.edit_Address
);
userRoute.post("/set-default-address/:addressId", addressController.setDefault);




userRoute.post("/add-to-cart", cartController.addToCart);



userRoute.post("/update-cart-quantity",cartController.cartQuantity);
userRoute.post("/remove-from-cart", cartController.cartRemove);



userRoute.get("/place-order", authRoutes.checkUser,authRoutes.isLogin, orderController.createOrders);

userRoute.get(
  "/pending-order",
  authRoutes.checkUser,
  authRoutes.isLogin,
  orderController.createPendingOrders
);



userRoute.post("/payment", orderController.Payment);

userRoute.post("/completePayment", orderController.pendingPayment);

userRoute.post("/cancel-order", orderController.cancelOrder);
userRoute.post("/return-order", orderController.returnOrder);

userRoute.get("/completePayment", orderController.completePayment);


userRoute.get(
  "/order-details",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  orderController.getOrderDetails
);


userRoute.get("/checkQuantities", cartController.checkQuantities);


userRoute.get("/generateInvoice", orderController.generateInvoice);

userRoute.get("/Invoice", orderController.loadInvoice);


userRoute.get("/add-delete",addressController.deleteAddress);

userRoute.post(
  "/change-password",
  userController.changePassword
);

userRoute.post("/edit-user", userController.editUserDetails) 

userRoute.post("/applyCoupon", cartController.Applycoupon);

userRoute.post("/addToWishlist", wishlistController.addToWishlist);

userRoute.get(
  "/wishlist",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  wishlistController.viewWishlist
);


userRoute.post("/addToWallet",walletController.addToWallet);

userRoute.post("/remove-from-wishlist", wishlistController.removeFromwishlist);

userRoute.get("/wallet/add",walletController.addMoney);

userRoute.get(
  "/walletHistory",
  authRoutes.isLogin,
  authRoutes.isBlocked,
  walletController.ViewWalletHistory
);

module.exports= userRoute;