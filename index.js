require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/OffsideOutfits");

const expressValidator = require("express-validator");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());



const path = require("path");
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);



const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/products", express.static(path.join(__dirname, "public")));
app.use("/admin/static", express.static(path.join(__dirname, "public")));
app.use("/admin/users", express.static(path.join(__dirname, "public")));
app.use("/admin/products", express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public")));

app.use("/static", express.static(path.join(__dirname, "lib")));
app.use("/static/products", express.static(path.join(__dirname, "lib")));

app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.static("lib"));

app.listen(3000, function () {
  console.log("Server is Running.... http://localhost:3000/");
});
