const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");



const loadProducts = async (req, res) => {
  try {
    console.log("in load products");
    const { priceSort, nameSort, selectedCategories, search, page, sortBy } =
      req.query;
    console.log("search" + search);

    const limit = 8; 
    const skip = (page - 1) * limit;

    let products;

    if (priceSort || nameSort || selectedCategories || search) {
      products = await sortProducts(req, res, skip, limit);
    } else {
      products = await Product.find()
        .skip(skip)
        .limit(limit)
        .populate("category");
    }

    const totalProducts = await Product.countDocuments(); 

    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find();

   
    res.render("products", {
      products,
      categories,
      totalPages,
      currentPage: page,
      sortBy,
      filterByCategory: selectedCategories,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const sortProducts = async (req, res) => {
  try {
    const { priceSort, nameSort, selectedCategories, search } = req.query;

    console.log("Name sort:" + nameSort);
    console.log("Price sort:" + priceSort);
    console.log("selectedCategories:" + selectedCategories);

    let sortObject = {};

    if (priceSort !== "undefined") {
      sortObject.priceAfterDiscount = priceSort === "lowToHigh" ? 1 : -1;
    }

    if (nameSort !== "undefined") {
      sortObject.pname = nameSort === "aToZ" ? 1 : -1;
      console.log(`Name sorting selected: ${nameSort}`);
    }

    
    let filterObject = {};

   
    if (search) {
      filterObject.$or = [
        { pname: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { "category.cName": { $regex: search, $options: "i" } },
      ];
    }

    let query = Product.find(filterObject).populate("category");

    if (selectedCategories && selectedCategories.length > 0) {
      const categoryIds = selectedCategories.split(",");
      query = query.find({ category: { $in: categoryIds } });
      console.log(`selectedCategories selected: ${categoryIds}`);
    }

    
    const products = await query.sort(sortObject);

    res.json({ products });
    console.log("Fetch");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};










const loadProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("ViewProduct", { product });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};



const add_Product = async (req, res) => {
  try {

    const images = req.files.map((file) => file.filename);

    const sizeNames = ["XS", "S", "M", "L", "XL", "XXL"];

    const sizes = sizeNames.map((size) => ({
      size: size,
      quantity: req.body.sizes[size] || 0,
    }));

    console.log(req.body);

    const newProduct = new Product({
      pname: req.body.ProductName,
      price: req.body.ProductPrice,
      description: req.body.ProductDetails,
      sizes: sizes,
      category: req.body.productCategory,
      is_listed: req.body.listed,
      brand: req.body.ProductBrand,
      images: images,
    });

    await newProduct.save();
    console.log(newProduct);
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getCategories = async () => {
  try {
    const categories = await Category.find({}, "cName");
    return categories;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const result = await Product.deleteOne({ _id: productId });

    if (result) {
      res.redirect("/admin/products");
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editProduct = async (req, res) => {
  try {
    console.log("Edit product");
    const id = req.query.id;
    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const categories = await getCategories();

    res.render("editProduct", { product, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const edit_product = async (req, res) => {
  try {
    const id = req.query.id;

    const sizeNames = ["XS", "S", "M", "L", "XL", "XXL"];

    const sizes = sizeNames.map((size) => ({
      size: size,
      quantity: req.body.sizes[size] || 0,
    }));

    const updatedProductData = await Product.findByIdAndUpdate(id, {
      _id: id,
      pname: req.body.ProductName,
      price: req.body.ProductPrice,
      description: req.body.ProductDetails,
      category: req.body.productCategory,
      is_listed: req.body.listed,
      brand: req.body.ProductBrand,
      sizes: sizes,
    });

    res.redirect(`/admin/products`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



// *********Admin************

const addProduct = async (req, res) => {
  try {
    console.log("product");
    const categories = await getCategories();
    const itemsPerPage = 10;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const visiblePages = 5; 
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));

    res.render("addProduct", {
      categories,
      currentPage,
      totalPages,
      startPage,
    });
  } catch (error) {
    console.log(error.message);
  }
};
















module.exports = {
  loadProduct,
  loadProducts,
  addProduct,
  addProduct,
  edit_product,
  editProduct,
  deleteProduct,
  add_Product,
};