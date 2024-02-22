const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");



const loadCart = async (req, res) => {
  try {
    console.log("in cart");

    const cartItems = await Cart.find();

    const productIds = cartItems.reduce((ids, item) => {
      const itemProductIds = item.cartProducts.map(
        (product) => product.product
      );
      return [...ids, ...itemProductIds];
    }, []);

    const products = await Product.find({ _id: { $in: productIds } });

    const cartWithProductDetails = cartItems.map((cartItem) => {
      const cartProducts = cartItem.cartProducts.map((product) => {
        const productDetail = products.find((p) =>
          p._id.equals(product.product)
        );
        return {
          ...product.toObject(),
          productDetail: productDetail || null,
        };
      });

      return {
        ...cartItem.toObject(),
        cartProducts,
      };
    });

    console.log("cart Items", cartWithProductDetails);

    res.render("cart", { cartItems: cartWithProductDetails });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};






const addToCart = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        cartProducts: [{ product: productId }],
      });
    } else {
      if (cart.cartProducts.some((item) => item.product.equals(productId))) {
        return res.status(200).json({
          alreadyExists: true,
          message: "Product already in the cart.",
        });
      }

      cart.cartProducts.push({ product: productId });
    }

    await cart.save();

  return res.status(200).json({
    alreadyExists: false,
    success: true,
    message: "Product added to cart.",
    cartCount: cart.cartProducts.length, // Add this line to return the updated cart count
  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};



const cartQuantity = async (req, res) => {
  const { cartId, productId, newQuantity } = req.body;

  try {
    let cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const productInCart = cart.cartProducts.find((product) =>
      product.product.equals(productId)
    );

    if (!productInCart) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    productInCart.quantity = newQuantity;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated successfully.",
      cartCount: cart.cartProducts.length, // Add this line to return the updated cart count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};



const cartRemove = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    let cart = await Cart.findById(cartId);
    const productIndex = cart.cartProducts.findIndex((product) =>
      product.product.equals(productId)
    );

    if (!cart || productIndex === -1) {
      return res.status(404).json({ error: "Cart or product not found." });
    }

    cart.cartProducts.splice(productIndex, 1);

    await cart.save();

  res.status(200).json({
    success: true,
    message: "Product removed successfully.",
    cartCount: cart.cartProducts.length, 
  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};


const loadCheckout = async (req, res) => {
  try {
    const userId = res.locals.currentUser._id.toString();
    const userAddresses = await Address.find({ user: userId });
    console.log("User Addresses:", userAddresses);
    const cartItems = await Cart.find();

    const productIds = cartItems.reduce((ids, item) => {
      const itemProductIds = item.cartProducts.map(
        (product) => product.product
      );
      return [...ids, ...itemProductIds];
    }, []);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalAmount = 0; 

    const cartWithProductDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        let totalAmountPerCart = 0; 

        const cartProducts = await Promise.all(
          cartItem.cartProducts.map(async (product) => {
            const productDetail = products.find((p) =>
              p._id.equals(product.product)
            );

            const productAmount = productDetail.price * product.quantity;
            totalAmountPerCart += productAmount; 
            totalAmount += productAmount; 
            return {
              ...product.toObject(),
              productDetail: productDetail,
              productAmount: productAmount,
            };
          })
        );

        return {
          ...cartItem.toObject(),
          cartProducts,
          totalAmountPerCart,
        };
      })
    );

    console.log("Total Amount:", totalAmount);
    console.log("cart=", cartWithProductDetails);

    res.render("checkout", {
      userAddresses,
      cartItems: cartWithProductDetails,
      totalAmount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {

  loadCart,
  loadCheckout,
  addToCart,
  cartRemove,
  cartQuantity,

};