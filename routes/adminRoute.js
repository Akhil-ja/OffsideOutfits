const express = require("express");

const bodyParser = require("body-parser");

const adminRoute = express();

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/Admin");

const adminController = require("../controllers/adminController");
    

adminRoute.get("/login", adminController.loadAdminLog);

adminRoute.all("/dashboard", adminController.loadDashboard);

adminRoute.get("/products", adminController.loadProducts);

adminRoute.get("/users", adminController.loadUsers);


module.exports = adminRoute;