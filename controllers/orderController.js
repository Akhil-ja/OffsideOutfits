const Orders = require("../models/ordersModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const productModel = require("../models/productModel");


const createOrders = async (req, res) => {
  try {
    const { userID, address, PaymentType } = req.body;

   
    console.log("Payment Type: " + PaymentType);

   
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
                message: `Sorry, we don't have enough stock  in size ${orderProduct.size}. Please choose a lower quantity.`,
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

          // Clearing cart after successful order
          cart.cartProducts = [];
          await cart.save();

          // Responding with success and order details
          return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderDetails: { orderAddress, orderProducts, newOrder },
          });
        } catch (error) {
          // Handling and responding with an error message
          console.error(error);
          return res
            .status(400)
            .json({ success: false, message: error.message });
        }
      } else {
        // Responding with an error if address is not found
        return res.status(404).json({
          success: false,
          message: "Address not found. Please choose a valid address.",
        });
      }
    } else {
      // Responding with an error if document is not found
      return res.status(404).json({
        success: false,
        message: "Document not found. Please try again.",
      });
    }
  } catch (error) {
    // Responding with an internal server error if an exception occurs
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};







const viewOrders= async(req,res)=>{
try {
 const userID=res.locals.currentUser._id;

 const AllOrders = await Orders.find({ user: userID })
   .populate({
     path: "products.product", 
     model: "Product",
   })
   .exec();

  console.log("All orders>>>>>>>>>"+AllOrders);
  res.render("orders", { AllOrders });
} catch (error) {
   console.error(error.message);
}
}


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
   
    const AllOrders = await Orders.findOne({ _id: orderId }) // Use findOne to find a specific order by ID
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





module.exports = {
  createOrders,
  viewOrders,
  getOrderDetails,
  adminViewOrders,
  adminGetOrderDetails,
  UpdateOrderStatus,
};