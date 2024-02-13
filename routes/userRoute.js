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

userRoute.get("/home",authRoutes.isLogin,authRoutes.checkUser, userController.loadHome );

userRoute.post("/register", userController.initialSignUp);

userRoute.post("/verify-otp", userController.insertUser);

userRoute.get("/products", authRoutes.isLogin, userController.loadCategory);

userRoute.get("/cart", authRoutes.isLogin, userController.loadCart);

userRoute.get(
  "/products/:productId",
  authRoutes.isLogin,
  userController.loadProduct
);

userRoute.get("/checkOut", authRoutes.isLogin, userController.loadCheckout);

userRoute.get("/profile", authRoutes.isLogin, userController.loadProfile);

userRoute.get("/logout", userController.userLogout);


userRoute.get("/add-address", userController.addAddress);




module.exports= userRoute;