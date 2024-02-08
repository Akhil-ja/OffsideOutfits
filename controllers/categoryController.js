const createCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      cName: req.body.categoryName,
      description: req.body.description,
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    // Redirect to a success page or do something else
    res.redirect("/admin/category");
  } catch (error) {
    // Handle errors, you might want to render an error page
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

