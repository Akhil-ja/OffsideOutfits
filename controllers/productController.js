const add_Product = async (req, res) => {
  try {
    const images = req.files.map((file) => file.filename);

    const newProduct = new Product({
      pname: req.body.ProductName,
      price: req.body.ProductPrice,
      description: req.body.ProductDetails,
      sizes: req.body.pname,
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

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product by ID and remove it
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
    const id = req.query.id;
    const product = await Product.findById(id);

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    const categories = await getCategories();
    const selectedCategory = product.category; // Assuming the category is stored in the 'category' field of the product

    res.render("editProduct", { product, categories, selectedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const edit_product = async (req, res) => {
  try {
    // Extract the user ID from the query parameter
    const id = req.query.id;

    // Update the user details based on the data in req.body
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      pname: req.body.ProductName,
      price: req.body.ProductPrice,
      description: req.body.ProductDetails,
      sizes: req.body.pname,
      category: req.body.productCategory,
      is_listed: req.body.listed,
      brand: req.body.ProductBrand,
      images: req.body.ProductImages,
    });

    const selectedCategory = req.body.productCategory;
    res.redirect(`/admin/products?selectedCategory=${selectedCategory}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


