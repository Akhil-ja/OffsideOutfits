const express=require("express");


const bodyParser = require("body-parser");


const userRoute=express();


userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

userRoute.set("view engine","ejs");
userRoute.set("views","./views/User");

const userController=require("../controllers/userController");

userRoute.get("/register",userController.loadlogin);
userRoute.post("/register", userController.insertUser);

userRoute.post("/login", userController.verifyLogin);

userRoute.get("/home", userController.loadHome);

userRoute.get("/", userController.loadLanding);

module.exports= userRoute;