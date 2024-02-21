const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const { findById } = require("../models/userModel");
const productModel = require("../models/productModel");

const createOrders = async (req, res) => {
  try {
    console.log("create order");

    const { userID, address, totalAmount } = req.body;

    console.log(totalAmount);

    const cart = await Cart.findOne({ user: userID }).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    const orderDocument = await Address.findOne({
      "address._id": address,
    });

    if (orderDocument) {
      const orderAddress = orderDocument.address.find(
        (addr) => addr._id.toString() === address
      );

      if (orderAddress) {
        const orderProducts = cart.cartProducts.map((cartProduct) => ({
          product: cartProduct.product, 
          quantity: cartProduct.quantity,
          price: cartProduct.product.price,
        }));

        const newOrder = new Orders({
          user: userID,
          products: orderProducts,
          status: "pending",
          address: orderAddress,
          orderDate: Date.now(),
        });

        await newOrder.save();
           cart.cartProducts = [];
           await cart.save();
        res.render("orderConfirmation", {
          orderAddress,
          orderProducts,
          newOrder,
        });

      } else {
        res.status(404).json({ error: "Address not found" });
      }
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (error) {
    console.error(error.message);
  }
};



const viewOrders= async(req,res)=>{
try {
 const userID=res.locals.currentUser._id;

 
 const AllOrders = await Orders.find({ user: userID })
   .populate({
     path: "products.product", // Ensure correct path to the Product model
     model: "Product",
   })
   .exec();

  console.log("All orders>>>>>>>>>"+AllOrders);
  res.render("orders", { AllOrders });
} catch (error) {
   console.error(error.message);
}
}

module.exports = {
  createOrders,
  viewOrders,
};