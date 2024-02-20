
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
    const categories = await Category.find();
    const errorMessage = "";
    res.render("category", { categories, errorMessage });
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
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).send("Category not found");
    }
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