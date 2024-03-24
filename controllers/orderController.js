const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const productModel = require("../models/productModel");
const RazorPay = require("razorpay");
const Wallet =require("../models/walletModel")
const mongoose = require("mongoose");







const createOrders = async (req, res) => {
  try {
    console.log("create order");

    const userID = req.session.userID;
    const selectedAddress = req.session.selectedAddress;
    const paymentType = req.session.paymentType;
   
    console.log("userid:" + userID);
    console.log("address:" + selectedAddress);
    console.log("paymenntType:" + paymentType);


    let orderAddress = "";

    const cart = await Cart.findOne({ user: userID }).populate({
      path: "cartProducts.product",
      model: "Product",
    });

 const couponApplied = cart.couponApplied;

    const orderDocument = await Address.findOne({
      "address._id": selectedAddress,
    });

    if (orderDocument) {
      orderAddress = orderDocument.address.find(
        (addr) => addr._id.toString() === selectedAddress
      );

      console.log("orderAddress:" + orderAddress);

      if (orderAddress) {
       
        const totalAmount = cart.cartTotal;

        const orderProducts = cart.cartProducts.map((cartProduct) => ({
          product: cartProduct.product,
          quantity: cartProduct.quantity,
          price: cartProduct.product.priceAfterDiscount,
          size: cartProduct.size,
        }));

        
orderProducts.forEach((orderProduct) => {
  console.log("size:" + orderProduct.size);
});

        
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

        

const generateRandomNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};


const isOrderIdExists = async (orderId) => {
  const existingOrder = await Orders.findOne({ orderID: orderId });
  return !!existingOrder;
};

let generatedOrderId;


do {
  
  const randomNumber = generateRandomNumber();

  
  generatedOrderId = `OOF${randomNumber}`;

} while (await isOrderIdExists(generatedOrderId));


const newOrder = new Orders({
  orderID: generatedOrderId,
  user: userID,
  products: orderProducts,
  status: "pending",
  address: orderAddress,
  orderDate: Date.now(),
  orderTotal: totalAmount,
  PaymentMethod: paymentType,
  couponApplied: couponApplied,
});

await newOrder.save();

       
          cart.cartProducts = [];
          cart.cartTotal=0;
          await cart.save();

          return res.render("orderConfirmation", {
            orderAddress,
            orderProducts,
            newOrder,
            updatedTotalAmount: totalAmount, 
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
          totalAmount += productInfo.priceAfterDiscount * productInfo.quantity;
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
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;
    const visiblePages = 5;
    const totalOrders = await Orders.countDocuments();
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    let AllOrders;
    if (totalOrders > 0) {
      AllOrders = await Orders.find()
        .populate({
          path: "user",
          model: "User",
        })
        .populate({
          path: "products.product",
          model: "Product",
        })
        .sort({ orderDate: -1 })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .exec();
    } else {
      AllOrders = [];
    }

    res.render("orders", {
      AllOrders,
      currentPage,
      startPage,
      endPage,
      totalPages,
    });
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
        totalAmount += productInfo.priceAfterDiscount * productInfo.quantity;
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
     console.log("orderId" + orderId);
     const allowedStatusValues = [
       "pending",
       "completed",
       "cancelled",
       "delivered",
     ];
     if (!allowedStatusValues.includes(newStatus)) {
       return res.status(400).send("Invalid status value");
     }

     const updatedOrder = await Orders.findByIdAndUpdate(orderId,
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


const cancelOrder = async (req, res) => {
  try {
    console.log("in cancel order");
    const orderId = req.query.orderId;
    const userID = res.locals.currentUser._id;
    console.log("userID:" + userID);
    console.log("Cancelling order with ID: " + orderId);




    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { $set: { status: "cancelled",returnReason:req.body.reason } },
      { new: true }
    )
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "products.product",
        model: "Product",
      });

    console.log("Updated order:", updatedOrder);

    for (const product of updatedOrder.products) {
      const productId = product.product._id;
      const quantityOrdered = product.quantity;

      console.log(
        `Updating product stock for product ID ${productId} with quantity ${quantityOrdered}`
      );

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { "sizes.$[size].quantity": quantityOrdered } },
        {
          arrayFilters: [{ "size.size": product.size }],
          new: true,
        }
      );
    }

    if (updatedOrder.PaymentMethod !== "COD") {
      let userWallet = await Wallet.findOne({ user: userID });

      if (!userWallet) {
        userWallet = new Wallet({
          user: userID,
          money: updatedOrder.orderTotal,
        });
      } else {
        userWallet.money += updatedOrder.orderTotal;
      }

      userWallet.transactions.push({
        amount: updatedOrder.orderTotal,
        type: "cancelled",
      });

      await userWallet.save();
    }

    console.log("Order cancellation successful");

    
    if (req.xhr) {
      return res.status(200).json({ message: "Order cancelled successfully" });
    }

    
    res.redirect(`/order-details?orderID=${orderId}`);
  } catch (error) {
    console.error("Error cancelling order:", error.message);
    
    if (req.xhr) {
      return res.status(500).json({ error: "Order cancellation failed" });
    }
    
    res.redirect(`/order-details?orderID=${orderId}`);
  }
};



const returnOrder = async (req, res) => {
  try {
    console.log("in return order");
    const orderId = req.body.orderId; 
    const userID = res.locals.currentUser._id;

    console.log("return reason:" + req.body.reason);

    console.log("Returning order with ID:", orderId);
    console.log("User ID:", userID);

   
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { $set: { status: "returned", returnReason: req.body.reason } },
      { new: true }
    )
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "products.product",
        model: "Product",
      });

    console.log("Updated order:", updatedOrder);

    
    for (const product of updatedOrder.products) {
      const productId = product.product._id;
      const quantityReturned = product.quantity;

      console.log(
        `Increasing product stock for product ID ${productId} with quantity ${quantityReturned}`
      );

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { "sizes.$[size].quantity": quantityReturned } },
        {
          arrayFilters: [{ "size.size": product.size }],
          new: true,
        }
      );
    }

    let userWallet = await Wallet.findOne({ user: userID });

    if (!userWallet) {
      userWallet = new Wallet({
        user: userID,
        money: updatedOrder.orderTotal,
      });
    } else {
      userWallet.money += updatedOrder.orderTotal;
    }

    userWallet.transactions.push({
      amount: updatedOrder.orderTotal,
      type: "returned",
    });

    await userWallet.save();

    console.log("Order return successful");

   
     return res.status(200).json({ message: "Order returb successfully" });
   
    
  } catch (error) {
    console.error("Error returning order:", error.message);

    res.status(500).send("Error returning order");
  }
};




const Payment = async (req, res) => {
  try {

    console.log("in paymenty");
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
    let total = cart.cartTotal.toFixed(2);
    console.log(typeof(cart.cartTotal));
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
          price: cartProduct.product.priceAfterDiscount,
          size: cartProduct.size,
        }));

        console.log("ordered products:", orderProducts);

        

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
    }else if (paymentType === "Wallet") {
      

      const amount = total;
      

      let wallet = await Wallet.findOne({ user: userID });

      if (!wallet || wallet.money < amount) {
        console.log("no enough money");
      } else {

        
        wallet.money -= parseFloat(amount);
        wallet.transactions.push({
          amount: parseFloat(amount),
          type: "Debit",
        });
        await wallet.save();

        const redirectURL = "/place-order";
        return res.status(303).json({
          success: false,
          message: "Payment type other than RazorPay. Redirecting...",
          redirectURL: redirectURL,
        });

      }
      

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
  cancelOrder,
  returnOrder,
};