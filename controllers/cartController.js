const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon=require("../models/couponModel")
const Wallet = require("../models/walletModel");
const Order=require("../models/ordersModel")


const loadCart = async (req, res) => {
  try {
  

    const currentUser = res.locals.currentUser._id;

   

    const cartItems = await Cart.findOne({ user: currentUser });

  

    if (!cartItems || cartItems.cartProducts.length === 0) {
     
      return res.render("cart", { cartItems: [] });
    }

    const productIds = cartItems.cartProducts.map((product) => product.product);

    const products = await Product.find({ _id: { $in: productIds } });

    const cartWithProductDetails = {
      ...cartItems.toObject(),
      cartProducts: cartItems.cartProducts.map((product) => {
        const productDetail = products.find((p) =>
          p._id.equals(product.product)
        );
        return {
          ...product.toObject(),
          productDetail: productDetail || null,
        };
      }),
    };

  

    res.render("cart", { cartItems: [cartWithProductDetails] });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};






const addToCart = async (req, res) => {
  try {
    const { productId, userId, size } = req.body;

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
        cartProducts: [
          {
            product: productId,
            size: size,
           
          },
        ],
         
      });
    } else {
      if (cart.cartProducts.some((item) => item.product.equals(productId))) {
        return res.status(200).json({
          alreadyExists: true,
          message: "Product already in the cart.",
        });
      }

      cart.cartProducts.push({ product: productId, size: size }); 
    }

let cartTotal = 0;

for (const item of cart.cartProducts) {
  const productDoc = await Product.findById(item.product);
  cartTotal += parseFloat(
    (productDoc.priceAfterDiscount * item.quantity).toFixed(2)
  );
}

cart.cartTotal = parseFloat(cartTotal.toFixed(2));
cart.oldCartTotal = parseFloat(cartTotal.toFixed(2));

await cart.save();




    return res.status(200).json({
      alreadyExists: false,
      success: true,
      message: "Product added to cart.",
      cartCount: cart.cartProducts.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};




const cartQuantity = async (req, res) => {
  const { cartId, productId, newQuantity } = req.body;



  try {
    let cart = await Cart.findById(cartId).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const productInCart = cart.cartProducts.find((product) =>
      product.product._id.equals(productId)
    );

    if (!productInCart) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    const selectedSize = productInCart.size;
    const product = productInCart.product;
    const sizesArray = product.sizes;

    let availableStock;

    for (const sizeObj of sizesArray) {
      if (sizeObj.size === selectedSize) {
        availableStock = sizeObj.quantity;
        break;
      }
    }

   

    if (newQuantity > productInCart.quantity && newQuantity > availableStock) {
      return res.status(400).json({
        error: "Requested quantity exceeds available stock.",
        type: "insufficientStock",
      });
    }

    productInCart.quantity = newQuantity;

    let cartTotal = 0;

    for (const item of cart.cartProducts) {
      const productDoc = await Product.findById(item.product);
      cartTotal += parseFloat(
        (productDoc.priceAfterDiscount * item.quantity).toFixed(2)
      );
    }

    cart.cartTotal = parseFloat(cartTotal.toFixed(2));
    cart.oldCartTotal = parseFloat(cartTotal.toFixed(2));

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated successfully.",
      cartCount: cart.cartProducts.length,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};






const cartRemove = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    let cart = await Cart.findById(cartId).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const productIndex = cart.cartProducts.findIndex((product) =>
      product.product._id.equals(productId)
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    const removedProduct = cart.cartProducts.splice(productIndex, 1)[0];

    
   let cartTotal = 0;

   for (const item of cart.cartProducts) {
     const productDoc = await Product.findById(item.product);
     cartTotal += parseFloat(
       (productDoc.priceAfterDiscount * item.quantity).toFixed(2)
     );
   }

   cart.cartTotal = parseFloat(cartTotal.toFixed(2));
   cart.oldCartTotal = parseFloat(cartTotal.toFixed(2));

   await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed successfully.",
      cartCount: cart.cartProducts.length,
      cartTotal: cart.cartTotal,
      removedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};


const loadCheckout = async (req, res) => {
  try {
    const userId = res.locals.currentUser._id;
    const userAddresses = await Address.find({ user: userId });
    const cartItems = await Cart.find({ user: userId });
    const wallet = await Wallet.findOne({ user: userId });
    const user = await User.findOne({ _id: userId });

    
    await Cart.updateOne({ user: userId }, { couponApplied: null });

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

            const productAmount =
              productDetail.priceAfterDiscount * product.quantity;
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

    let couponApplied = null;

    // If a coupon is applied, retrieve its details
    for (const cartItem of cartItems) {
      if (cartItem.couponApplied) {
        couponApplied = cartItem.couponApplied;
        break;
      }
    }

    // Construct the coupon query based on whether a coupon is applied or not
    const availableCouponsQuery = {
      status: "active",
      expiryDate: { $gt: new Date() },
    };

    // If a coupon is applied, exclude it from the available coupons list
    if (couponApplied) {
      availableCouponsQuery._id = {
        $nin: user.usedCoupons.map((coupon) => coupon._id),
      };
    }

    const availableCoupons = await Coupon.find(availableCouponsQuery);

    res.render("checkout", {
      userAddresses,
      cartItems: cartWithProductDetails,
      totalAmount,
      couponApplied,
      wallet,
      availableCoupons,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};





const checkQuantities = async (req, res) => {
  try {
    const cartItems = await Cart.find({
      user: res.locals.currentUser._id,
    }).populate({
      path: "cartProducts.product",
      model: "Product",
    });

    const errors = [];

    for (const cartItem of cartItems) {
      for (const item of cartItem.cartProducts) {
        const product = item.product;

        const selectedSize = item.size;
        const selectedQuantity = item.quantity;

        const sizeInfo = product.sizes.find(
          (size) => size.size === selectedSize
        );

        if (!sizeInfo) {
          errors.push(
            `Size info error ${selectedSize} not available for product ${product.pname}`
          );
        }

        const availableStock = sizeInfo ? sizeInfo.quantity : 0;

        if (selectedQuantity > availableStock) {
          errors.push(
            `Insufficient stock for product ${product.pname} size ${selectedSize}`
          );
        }
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors.join(". "); 
      res.status(400).send(errorMessage);
    } else {
      res
        .status(200)
        .send("All products have sufficient stock. Proceed to checkout.");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};





const Applycoupon = async (req, res) => {
  try {
    const { couponCode, userID, initialTotalAmount } = req.body;
    const user = await User.findOne({ _id: userID });
    let couponApplied = null;
    let couponDiscount = 0;
    const cart = await Cart.find({ user: userID });
    const coupon = await Coupon.findOne({ code: couponCode });

    if (coupon) {
      const currentDate = new Date();
      if (coupon.expiryDate < currentDate) {
        return res.status(400).json({ error: "Coupon has expired" });
      }

      const couponExist = await User.findOne({
        _id: userID,
        usedCoupons: { $in: [coupon._id] },
      });

      if (couponExist !== null) {
        return res.status(400).json({ error: "Coupon Already Used" });
      }

      if (coupon.discountType === "percentage") {
        couponDiscount = (coupon.discountValue / 100) * initialTotalAmount;
      } else if (coupon.discountType === "fixed") {
        if (coupon.minimumOffer <= initialTotalAmount) {
          couponDiscount = Math.min(initialTotalAmount, coupon.discountValue);
        } else {
          console.log(
            "Fixed amount is greater than the total. Coupon not applied."
          );
          return res
            .status(400)
            .json({ error: "Coupon minimum offer not met" });
        }
      }

      const newTotalAmount = initialTotalAmount - couponDiscount;
      if (newTotalAmount < coupon.minimumOffer) {
        return res.status(400).json({ error: "Coupon minimum offer not met" });
      }

      await Cart.updateOne(
        { user: userID },
        { cartTotal: newTotalAmount, couponApplied: coupon._id }
      );
      req.session.couponApplied = coupon._id;
      couponApplied = coupon.toObject();
    } else {
    
      return res.status(400).json({ error: "Coupon Does not exist" });
    }

  
    res.json({
      newTotalAmount: initialTotalAmount - couponDiscount,
      couponApplied,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again." });
  }
};




   

module.exports = {
  loadCart,
  loadCheckout,
  addToCart,
  cartRemove,
  cartQuantity,
  checkQuantities,
  Applycoupon,
};