const express = require("express");

const bodyParser = require("body-parser");

const adminRoute = express();

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");


const adminController = require("../controllers/adminController");
    

adminRoute.get("/login", adminController.loadAdminLog);
adminRoute.get("/dashboard", adminController.loadDashboard);
adminRoute.get("/products", adminController.loadProducts);
adminRoute.get("/users", adminController.loadUsers);
adminRoute.get("/users/edit",adminController.editUser);
adminRoute.get("/users/add-user", adminController.addUser);
adminRoute.post("/users/add-user", adminController.add_User);
adminRoute.get("/products/add-product", adminController.addProduct);
adminRoute.get("/products/edit-product", adminController.editProduct);
adminRoute.get("/category", adminController.viewCategory);
adminRoute.get("/users/delete", adminController.delete_User);


adminRoute.post("/users/edit", adminController.edit_User)




adminRoute.post("/add-product", adminController.add_Product)






module.exports = adminRoute;