const express = require("express");
const adminController = require("../controllers/adminController");
const authRoutes = require("../services/authRoutes");
const bodyParser = require("body-parser");
const multer = require("multer");

const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const userController = require("../controllers/userController");
const couponController = require("../controllers/couponController");
const offerController=require("../controllers/offerController")








const adminRoute = express();

adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");








adminRoute.get("*", authRoutes.checkUser);


adminRoute.get("/login", adminController.loadAdminLog);
adminRoute.post("/login", adminController.adminLogin);

adminRoute.get(
  "/products",
  authRoutes.isAdminLogin,
  adminController.loadAdminProducts
);
adminRoute.get("/users", authRoutes.isAdminLogin, userController.loadUsers);
adminRoute.get(
  "/users/edit",
  authRoutes.isAdminLogin,
  userController.editUser
);


adminRoute.get(
  "/products/add-product",
  authRoutes.isAdminLogin,
  productController.addProduct
);

adminRoute.get(
  "/products/edit-product",
  authRoutes.isAdminLogin,
  productController.editProduct
);


adminRoute.get(
  "/category",
  authRoutes.isAdminLogin,
  categoryController.viewCategory
);


adminRoute.post("/users/edit", userController.edit_User);

adminRoute.get(
  "/delete-product/:productId",
  authRoutes.isAdminLogin,
  productController.deleteProduct
);

adminRoute.get(
  "/category/delete",
  authRoutes.isAdminLogin,
  categoryController.deleteCategory
);





// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public/productAssets/");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage: storage });



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/productAssets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  },
});

const upload = multer({ storage: storage });





adminRoute.post("/products/edit-product", productController.edit_product);



  adminRoute.post(
    "/add-product",
    upload.array("ProductImage", 4),
    productController.add_Product
  );



adminRoute.post(
  "/products/edit-product",
  upload.array("ProductImage", 4),
  productController.edit_product
);



adminRoute.post(
  "/products/editproductImagePOST",
  upload.single("ProductImage"),
  adminController.editproductImagePOST
);


adminRoute.post("/category", categoryController.createCategory);


adminRoute.get(
  "/logout",authRoutes.isAdminLogin,  adminController.adminLogout
);

adminRoute.get(
  "/orders",
  authRoutes.isAdminLogin,
  orderController.adminViewOrders
);

adminRoute.get(
  "/orders/details",
  authRoutes.isAdminLogin,
  orderController.adminGetOrderDetails
);

adminRoute.patch(
  "/orders/details/update-status",
  orderController.UpdateOrderStatus
);

adminRoute.get(
  "/coupons",
  authRoutes.isAdminLogin,
  couponController.viewCoupons
);

adminRoute.post("/createCoupon", couponController.createCoupon);

adminRoute.get(
  "/editStatus",
  authRoutes.isAdminLogin,
  couponController.editCouponStatus
);

adminRoute.get(
  "/viewCoupon",
  authRoutes.isAdminLogin,
  couponController.viewCoupon
);

adminRoute.get(
  "/editCoupon",
  authRoutes.isAdminLogin,
  couponController.viewEditCoupon
);
adminRoute.post("/editCoupon", couponController.editCoupon);

adminRoute.get("/offers", authRoutes.isAdminLogin, offerController.viewOffers);



adminRoute.get(
  "/categoryOffer",
  authRoutes.isAdminLogin,
  offerController.CategoryOffer
);

adminRoute.get(
  "/productOffer",
  authRoutes.isAdminLogin,
  offerController.ProductOffer
);

adminRoute.get(
  "/referalOffers",
  authRoutes.isAdminLogin,
  offerController.ReferalOffer
);

adminRoute.post("/categoryOffer", offerController.addCategoryOffer);

adminRoute.post("/productOffer", offerController.addProductOffer);

adminRoute.post("/referalOffers", offerController.addReferalOffer);

adminRoute.post("/toggleOfferStatus", offerController.toggleStatus);

adminRoute.post("/toggleReferalStatus", offerController.toggleReferalStatus);

adminRoute.get(
  "/salesReport",
  authRoutes.isAdminLogin,
  adminController.viewsalesReport
);

adminRoute.get(
  "/dashboard",
  authRoutes.isAdminLogin,
  adminController.viewDashboard
);

adminRoute.post("/salesReport", adminController.filterOrdersByDate);




module.exports = adminRoute;
