const User = require('../models/usermodel');
const Product = require('../models/productModel')
const orderHelper = require("../helpers/orderHelper");
const wishListHelper = require("../helpers/wishListHelper");
const couponHelpers = require('../helpers/couponHelper')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_FbBfPtRDxh8Wyx',
  key_secret: 'zrAqEoR5zwfUvRjAAxL7YILQ',
});




const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const couponCode = req.body.couponCode.toLowerCase();
        const couponData = await couponHelpers.getCouponDataByCouponCode(couponCode);
        const couponEligible = await couponHelpers.verifyCouponEligibility(couponCode);
  
        if (couponEligible.status) {
            const cartValue = await orderHelper.getCartValue(userId);
  
            if (cartValue >= couponData.minOrderValue) {
                const userEligible = await couponHelpers.verifyCouponUsedStatus(userId, couponData._id);
  
                if (userEligible.status) {
                    const applyNewCoupon = await couponHelpers.applyCouponToCart(userId, couponData._id);
  
                    if (applyNewCoupon.status) {
                        // Send JSON response with success message
                        res.json({ success: true, message: "Congrats, Coupon applied successfully" });
                        return; // Return to prevent further execution
                    } else {
                        // Send JSON response with error message
                        res.json({ success: false, message: "Sorry, Unexpected Error in applying coupon" });
                    }
                } else {
                    // Send JSON response with error message
                    res.json({ success: false, message: "Coupon already used earlier" });
                }
            } else {
                // Send JSON response with error message
                res.json({ success: false, message: `Coupon not applied, purchase minimum for ₹${couponData.minOrderValue} to get coupon` });
            }
        } else if (couponEligible.reasonForRejection) {
            // Send JSON response with error message
            res.json({ success: false, message: couponEligible.reasonForRejection });
        }
    } catch (error) {
        console.log("Error-3 from changeCouponStatusPOST couponController:", error.message);
        // Send JSON response with error message
        res.json({ success: false, message: "An error occurred while applying the coupon" });
    }
  };
   
   
   
  
  
  
   const verifyPayment = async (req, res) => {
    orderHelper
      .verifyOnlinePayment(req.body)
      .then(() => {
        console.log("request.body  ", req.body);
        //  let receiptId = req.body['serverOrderDetails[receipt]'];
        let receiptId = req.body.serverOrderDetails.receipt;
        console.log(receiptId);
        let paymentSuccess = true;
        orderHelper
          .updateOnlineOrderPaymentStatus(receiptId, paymentSuccess)
          .then(() => {
            // Sending the receiptId to the above userHelper to modify the order status in the DB
            // We have set the Receipt Id is same as the orders cart collection ID
            res.json({ status: true });
          });
      })
      .catch((err) => {
        if (err) {
          console.log(err.message);
          let paymentSuccess = false;
          orderHelper
            .updateOnlineOrderPaymentStatus(receiptId, paymentSuccess)
            .then(() => {
              // Sending the receiptId to the above userHelper to modify the order status in the DB
              // We have set the Receipt Id is same as the orders cart collection ID
  
              res.json({ status: false });
            });
        }
      });
  };
  
  
  const walletOrder = async (req, res) => {
    try {
      const orderId = req.query.id;
      const userId = req.session.user_id;
      const updatingWallet = await orderHelper.updateWallet(userId, orderId);
      res.redirect("/orderSucessfull");
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  };
   
   
   const orderSuccess = async (req,res)=>{
      try {
       const userId = req.session.user_id;
       const userData = await User.findById({ _id: userId });
       const wishlistCount = await wishListHelper.getWishListCount(
        req.session.user_id
      );
       const orders = await Order.find({ user: userId }).exec();
   
       if(userId){
         const isAuthenticated = true
         res.render("orderSuccess", {user:userData,wishlistCount,orders,isAuthenticated});
      }else{
         const isAuthenticated = false
         res.render("orderSuccess", {user:userData,wishlistCount,orders,isAuthenticated});
      }
      
      } catch (error) {
         console.log(error);
      }
   }
   
   const orderFailed = async (req,res)=>{
      try {
           const userId = req.session.user_id;
          const userData = await User.findById({ _id:userId});
   
          if(userId){
            const isAuthenticated = true
            res.render("orderFailed", {user:userData,isAuthenticated});
         }else{
            const isAuthenticated = false
            res.render("orderFailed", {user:userData,isAuthenticated});
         }  
      } catch (error) {
         console.log(error);
      }
   }


   const placeOrder = async (req,res)=>{
    try {
       
       let userId = req.session.user_id;
       let orderDetails = req.body;
 
       let orderedProducts = await orderHelper.getProductListForOrders(userId);
       console.log(orderedProducts);
 
       if(orderedProducts){
          for(const orderedProduct of orderedProducts){
             const productId = orderedProduct.product;
             const quantityOrdered = orderedProduct.quantity;
             console.log('productId', productId);
 
              // Find the product by ID
         const product = await Product.findById(productId);
       
         if (!product) {
           // Product not found, handle error
           throw new Error(`Product with ID ${productId} not found.`);
         }
       
         // Calculate the new stock after decrementing
         const newStock = product.stock - quantityOrdered;
       
         // Ensure the stock doesn't go below 0
         product.stock = Math.max(0, newStock);
       
         // Save the updated product
         const updatedProduct = await product.save();
         
         if (updatedProduct.stock < 0) {
          // Insufficient stock, handle error
          throw new Error(`Insufficient stock for product ${productId}.`);
          }
 
        }
 
        let totalOrderValue = await orderHelper.getCartValue(userId);
        console.log(totalOrderValue);

        const availableCouponData =
        await couponHelpers.checkCurrentCouponValidityStatus(
          userId,
          totalOrderValue
        );

        let couponDiscountAmount = 0;

        if (availableCouponData.status) {
          const couponDiscountAmount = availableCouponData.couponDiscount;
          // Inserting the value of coupon discount into the order details object created above
          orderDetails.couponDiscount = couponDiscountAmount;
  
          // Updating the total order value with coupon discount applied
          totalOrderValue -= couponDiscountAmount;
          const updateCouponUsedStatusResult =
            await couponHelpers.updateCouponUsedStatus(
              userId,
              availableCouponData.couponId
            );
  
          console.log("after Discount", totalOrderValue);
        }
 
        if (req.body["paymentMethod"] === "COD") {
          orderHelper.placingOrder(userId, orderDetails, orderedProducts, totalOrderValue).then(async (orderId, error) => {
          res.json({ COD_CHECKOUT: true });
            });
        }else if (req.body["paymentMethod"] === "ONLINE") {
          orderHelper
            .placingOrder(userId, orderDetails, orderedProducts, totalOrderValue)
            .then(async (orderId, error) => {
              // console.log('Ordercontroller',orderId)
  
              if (error) {
                res.json({ chekoutStatus: false });
              } else {
                orderHelper
                  .generateRazorpayOrder(orderId, totalOrderValue)
                  .then(async (razorpayOrderDetails, err) => {
                    // console.log('RZPY orderDetails',razorpayOrderDetails)
  
                    const user = await User.findById({ _id: userId }).lean();
  
                    res.json({
                      ONLINE_CHECKOUT: true,
                      userDetails: user,
                      userOrderRequestData: orderDetails,
                      orderDetails: razorpayOrderDetails,
                      razorpayKeyId:'rzp_test_FbBfPtRDxh8Wyx',
                    });
                  });
              }
            });
        }else if (req.body["paymentMethod"] === "WALLET") {
          const walletBalance = await orderHelper.walletBalance(userId);
          if (walletBalance.walletAmount >= totalOrderValue) {
            orderHelper
              .placingOrder(
                userId,
                orderDetails,
                orderedProducts,
                totalOrderValue
              )
              .then(async (orderId, error) => {
                res.json({ WALLET_CHECKOUT: true, orderId });
              });
          } else {
            res.json({ error: "Insufficient balance." });
          }
        }
 
       }else{
          res.json({ paymentStatus: false });
       }
       
    } catch (error) {
       console.log(error);
    }
 }


 module.exports = {
    placeOrder,
    orderFailed,
    orderSuccess,
    verifyPayment,
    walletOrder,
    applyCoupon
 }