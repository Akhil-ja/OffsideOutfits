const express = require("express");

const bodyParser = require("body-parser");

const multer = require("multer");
const path = require("path");

const adminRoute = express();

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

const adminController = require("../controllers/adminController");

const authRoutes=require("../services/authRoutes")






adminRoute.get("*", authRoutes.checkUser);


adminRoute.get("/login", adminController.loadAdminLog);
adminRoute.post("/login", adminController.adminLogin);
adminRoute.get("/dashboard", adminController.loadDashboard);
adminRoute.get(
  "/products",
  authRoutes.isAdminLogin,
  adminController.loadProducts
);
adminRoute.get("/users", authRoutes.isAdminLogin, adminController.loadUsers);
adminRoute.get(
  "/users/edit",
  authRoutes.isAdminLogin,
  adminController.editUser
);
adminRoute.get(
  "/users/add-user",
  authRoutes.isAdminLogin,
  adminController.addUser
);
adminRoute.post("/users/add-user", adminController.add_User);
adminRoute.get(
  "/products/add-product",
  authRoutes.isAdminLogin,
  adminController.addProduct
);

adminRoute.get(
  "/products/edit-product",
  authRoutes.isAdminLogin,
  adminController.editProduct
);
adminRoute.post("/products/edit-product",adminController.edit_product);

adminRoute.get(
  "/category",
  authRoutes.isAdminLogin,
  adminController.viewCategory
);
adminRoute.get(
  "/users/delete",
  authRoutes.isAdminLogin,
  adminController.delete_User
);

adminRoute.post("/users/edit", adminController.edit_User);

adminRoute.get(
  "/delete-product/:productId",
  authRoutes.isAdminLogin,
  adminController.deleteProduct
);

adminRoute.get(
  "/category/delete",
  authRoutes.isAdminLogin,
  adminController.deleteCategory
);




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/productAssets/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

adminRoute.post(
  "/add-product",
  upload.array("ProductImage", 4),
  adminController.add_Product
);

adminRoute.post("/category", adminController.createCategory);



adminRoute.get(
  "/logout",  adminController.adminLogout
);

module.exports = adminRoute;
