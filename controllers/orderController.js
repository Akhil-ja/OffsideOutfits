const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const productModel = require("../models/productModel");
const RazorPay = require("razorpay");


const createOrders = async (req, res) => {
  try {
    console.log("create order");

    const userID = req.session.userID;
    const selectedAddress = req.session.selectedAddress;

    console.log("userid:" + userID);
    console.log("address:" + selectedAddress);

    let orderAddress = "";

    const cart = await Cart.findOne({ user: userID }).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    const orderDocument = await Address.findOne({
      "address._id": selectedAddress,
    });

    if (orderDocument) {
      orderAddress = orderDocument.address.find(
        (addr) => addr._id.toString() === selectedAddress
      );

      console.log("orderAddress:" + orderAddress);

      if (orderAddress) {
        const orderProducts = cart.cartProducts.map((cartProduct) => ({
          product: cartProduct.product,
          quantity: cartProduct.quantity,
          price: cartProduct.product.price,
          size: cartProduct.size,
        }));

        try {
          for (const orderProduct of orderProducts) {
            const product = orderProduct.product;

            const sizeInfoIndex = product.sizes.findIndex(
              (sizeObj) => sizeObj.size === orderProduct.size
            );

            if (
              sizeInfoIndex === -1 ||
              product.sizes[sizeInfoIndex].quantity < orderProduct.quantity
            ) {
              return res.status(400).json({
                success: false,
                message: `Sorry, we don't have enough stock in size ${orderProduct.size}. Please choose a lower quantity.`,
              });
            }

            product.sizes[sizeInfoIndex].quantity -= orderProduct.quantity;
            await product.save();
          }

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

         
          return res.render("orderConfirmation", {
            orderAddress,
            orderProducts,
            newOrder,
          });
        } catch (error) {
          console.error(error);
          return res
            .status(400)
            .json({ success: false, message: error.message });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "Address not found. Please choose a valid address.",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Document not found. Please try again.",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};







const viewOrders = async (req, res) => {
  try {
    const userID = res.locals.currentUser._id;

    const AllOrders = await Orders.find({ user: userID })
      .populate({
        path: "products.product",
        model: "Product",
      })
      .exec()
      

    console.log("All orders>>>>>>>>>" + AllOrders);
    res.render("orders", { AllOrders });
  } catch (error) {
    console.error(error.message);
  }
};


const getOrderDetails=async(req,res)=>{
  try {

    const orderId = req.query.orderID;
    const orderDetails = await Orders.findById(orderId).populate({
      path: "products.product",
      model: "Product",
    });

     if (!orderDetails) {
       return res.status(404).send("Order not found");
     }
      const TotalAmount = (products) => {
        let totalAmount = 0;
        products.forEach((productInfo) => {
          totalAmount += productInfo.price * productInfo.quantity;
        });
        return totalAmount;
      };
     const totalAmount = TotalAmount(orderDetails.products);
     res.render("viewOrder", { orderDetails, totalAmount });
  } catch (error) {
    console.error(error.message);
  }
}

const adminViewOrders = async (req, res) => {
  try {
    const AllOrders = await Orders.find()
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "products.product",
        model: "Product",
      })
      .sort({ orderDate: -1 })
      .exec();

    console.log("All orders>>>>>>>>>" + AllOrders);
    res.render("orders", { AllOrders });
  } catch (error) {
    console.error(error.message);
  }
};


const adminGetOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderID;
   
    const AllOrders = await Orders.findOne({ _id: orderId }) 
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "products.product",
        model: "Product",
      })
      .exec();

    if (!AllOrders) {
      return res.status(404).send("Order not found");
    }

    const TotalAmount = (products) => {
      let totalAmount = 0;
      products.forEach((productInfo) => {
        totalAmount += productInfo.price * productInfo.quantity;
      });
      return totalAmount;
    };

    const totalAmount = TotalAmount(AllOrders.products);

    res.render("orderDetails", { AllOrders, totalAmount });
  } catch (error) {
    console.error(error.message);
  }
};



const UpdateOrderStatus=async(req,res)=>{
  try {
     const orderId = req.query.orderId;
     const newStatus = req.query.status;

     console.log("in order update");
     const allowedStatusValues = [
       "pending",
       "completed",
       "cancelled",
       "delivered",
     ];
     if (!allowedStatusValues.includes(newStatus)) {
       return res.status(400).send("Invalid status value");
     }

     const updatedOrder = await Orders.findByIdAndUpdate(
       orderId,
       { $set: { status: newStatus } },
       { new: true }
     );

     if (!updatedOrder) {
       return res.status(404).send("Order not found");
     }

     res
       .status(200)
       .json({ message: "Status updated successfully", updatedOrder });
  } catch (error) {
     console.error(error.message);
  }
}



const razorpay = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});




const Payment = async (req, res) => {
  try {
    const { userID, selectedAddress, paymentType } = req.body;

    
    
       console.log("Order Log:", { userID, selectedAddress, paymentType });

          req.session = req.session || {};

          req.session.selectedAddress = selectedAddress;
          req.session.paymentType = paymentType;
          req.session.userID = userID;

           req.session.save();

          console.log(
            "session address in payment:" + req.session.selectedAddress
          );


    const cart = await Cart.findOne({ user: userID }).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    const orderDocument = await Address.findOne({
      "address._id": selectedAddress,
    });

    let orderProducts = [];
    let total = 0;
    let orderAddress = "";

    if (orderDocument) {
      orderAddress = orderDocument.address.find(
        (addr) => addr._id.toString() === selectedAddress
      );

      console.log("The address:" + orderAddress);

      

      if (orderAddress) {
        orderProducts = cart.cartProducts.map((cartProduct) => ({
          product: cartProduct.product,
          quantity: cartProduct.quantity,
          price: cartProduct.product.price,
          size: cartProduct.size,
        }));

        console.log("ordered products:", orderProducts);

        orderProducts.forEach((product) => {
          total += product.price * product.quantity;
        });
        console.log("The Total:", total);

        for (const orderProduct of orderProducts) {
          const product = orderProduct.product;

          const sizeInfoIndex = product.sizes.findIndex(
            (sizeObj) => sizeObj.size === orderProduct.size
          );

          if (
            sizeInfoIndex === -1 ||
            product.sizes[sizeInfoIndex].quantity < orderProduct.quantity
          ) {
            return res.status(400).json({
              success: false,
              message: `Sorry, we don't have enough stock in size ${orderProduct.size}. Please choose a lower quantity.`,
            });
          }
        }
      }
    }

    console.log("entering razorpay");

    if (paymentType === "RazorPay") {
      console.log("entered razorpay");
      const options = {
        amount: total * 100,
        currency: "INR",
        receipt: "razorUser@gmail.com",
      };

      console.log("options", options);

      razorpay.orders.create(options, async (err, order) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "Error creating order." });
        }

        const orderID = order.id;

        return res.status(200).json({
          success: true,
          msg: "Order created successfully",
          order_id: orderID,
          amount: total,
          key_id: process.env.RAZORPAY_KEY_ID,
          contact: 8469237811,
          name: "Offside Outfits",
          email: "akhiljagadish124@gmail.com",
        });
      });
    } else {
      console.log("else");
      try {
         const redirectURL = "/place-order";
         return res.status(303).json({
           success: false,
           message: "Payment type other than RazorPay. Redirecting...",
           redirectURL: redirectURL,
         });
      } catch (saveError) {
        console.error("Error saving order to the database:", saveError);
        return res.status(500).json({
          success: false,
          message: "Error saving order to the database.",
        });
      }
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};






module.exports = {
  createOrders,
  viewOrders,
  getOrderDetails,
  adminViewOrders,
  adminGetOrderDetails,
  UpdateOrderStatus,
  Payment,
};