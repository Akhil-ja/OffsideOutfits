const express=require("express");


const bodyParser = require("body-parser");

const authRoutes=require("../services/authRoutes")


const userRoute=express();


userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

userRoute.set("view engine","ejs");
userRoute.set("views","./views/User");


const userController=require("../controllers/userController");

userRoute.get("*", authRoutes.checkUser);

userRoute.get("/register", userController.loadlogin);
userRoute.post("/login", userController.verifyLogin);

userRoute.post("/register", userController.initialSignUp);

userRoute.post("/verify-otp", userController.insertUser);

userRoute.use(authRoutes.isBlocked);

userRoute.get("/home",authRoutes.checkUser, userController.loadHome );


userRoute.get("/products",authRoutes.isBlocked, authRoutes.isLogin, userController.loadCategory);

userRoute.get("/cart", authRoutes.isLogin, userController.loadCart);

userRoute.get(
  "/products/:productId",
  authRoutes.isLogin,
  userController.loadProduct
);

userRoute.get("/checkOut", authRoutes.isLogin, userController.loadCheckout);

userRoute.get("/profile", authRoutes.isLogin, userController.loadProfile);

userRoute.get("/logout", userController.userLogout);


userRoute.get("/add-address",authRoutes.isLogin, userController.addAddress);
userRoute.post("/add-address",authRoutes.isLogin, userController.add_Address);


userRoute.get(
  "/edit-address?:addressId",
  authRoutes.isLogin,
  userController.editAddress
);
userRoute.post("/edit-address", authRoutes.isLogin, userController.edit_Address);




userRoute.post("/add-to-cart", userController.addToCart);



userRoute.post("/update-cart-quantity",userController.cartQuantity);
userRoute.post("/remove-from-cart", userController.cartRemove);






module.exports= userRoute;