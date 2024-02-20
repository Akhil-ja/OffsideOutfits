const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");


const viewOrders = async (req, res) => {
  try {
    res.render("orders");
  } catch (error) {
    console.log(error.message);
  }
};

const createOrders = async (req, res) => {
  try {
    console.log("create order");
    console.log(res.body.userID);
    const userId = res.body.userID;

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

    const cartWithProductDetails = cartItems.map((cartItem) => {
      const cartProducts = cartItem.cartProducts.map((product) => {
        const productDetail = products.find((p) =>
          p._id.equals(product.product)
        );

        return {
          ...product.toObject(),
          productDetail: productDetail,
        };
      });

      return {
        ...cartItem.toObject(),
        cartProducts,
      };
    });

    console.log("save part");
    const newOrder = new Orders({
      user: userId,
      products: {
        product: product.product,
        quantity: product.quantity,
      },
      status: "pending",
      orderDate: Date.now(),
      address: req.body.address,
    });

    await newOrder.save();

    res.redirect("/orders");
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
 
  viewOrders,
  createOrders,
};