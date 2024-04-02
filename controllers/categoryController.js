
const Category = require("../models/categoryModel");



const getCategories = async () => {
  try {
    const categories = await Category.find({}, "cName");
    return categories;
  } catch (error) {
    console.error(error);
    throw error;
  }
};



const viewCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / perPage);

    const categories = await Category.find()
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * perPage) 
      .limit(perPage); 


    const errorMessage = "";
    res.render("category", {
      categories,
      errorMessage,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const createCategory = async (req, res) => {
  try {
    const existingCategory = await Category.findOne({
      cName: req.body.categoryName,
    });

    if (existingCategory) {
      const categories = await Category.find();
      res.render("category", {
        categories,
        errorMessage: "Category already exists",
      });
      return;
    }

    const newCategory = new Category({
      cName: req.body.categoryName,
      description: req.body.description,
    });

    const savedCategory = await newCategory.save();

    res.redirect("/admin/category");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    if (!categoryId) {
      return res.status(400).send("Invalid category ID");
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }
   
    category.status = category.status === "active" ? "disabled" : "active";
    await category.save();
    res.redirect("/admin/category");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



module.exports = {
  deleteCategory,
  createCategory,
  viewCategory,
  getCategories,
  
};