const User = require('../models/usermodel');
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Wallet = require('../models/walletModel')
const orderHelper = require("../helpers/orderHelper");
const wishListHelper = require("../helpers/wishListHelper");
const couponHelpers = require('../helpers/couponHelper')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_FbBfPtRDxh8Wyx',
  key_secret: 'zrAqEoR5zwfUvRjAAxL7YILQ',
});



//user-addTocart

const userCart = async (req,res)=>{
    try {
       const userId = req.session.user_id
       const userData = await User.findById({_id:userId})
       let cart = await Cart.findOne({ user: userData._id }).populate("products.productId");
       
       if (cart){
          const isAuthenticated = true
          let products = cart.products;
          res.render("userCart",{user:userData,products:products,isAuthenticated});
       }else{
          const isAuthenticated = false
          res.render("userCart", { user:userData,products:null,isAuthenticated});
       }  
    } catch (error) {
       console.log(error);
    }
 }
 
 
 
 const addToCart = async (req,res)=>{
    try {
       const userId = req.session.user_id;
       const productId = req.params.id;
     
       const [user, product] = await Promise.all([
         User.findOne({ _id: productId }),
         Product.findOne({ _id: productId }),
       ]);
 
       if (!product || product.stock <= 0) {
         return res
           .status(400)
           .json({ status: false, message: "Product is out of stock." });
       }
   
       if (user || !product) {
         res.status(404);
       }
   
       const cartItem = {
         productId: product._id,
         quantity: 1,
         price: product.sales_price,
         subtotal: product.sales_price,
       };
   
       let cart = await Cart.findOne({ user: userId });
   
       if (!cart) {
         cart = new Cart({
           user: userId,
           products: [],
         });
       }
   
       const exisitingcartitem = cart.products.find(
         (item) => item.productId.toString() === product._id.toString()
       );
   
       if (exisitingcartitem) {
         exisitingcartitem.quantity += 1;
         exisitingcartitem.subtotal = exisitingcartitem.quantity * product.sales_price;
       } else {
         cart.products.push(cartItem);
       }
   
       // // Decrease the product stock
       // product.stock -= 1;
   
       await Promise.all([cart.save(), product.save()]);
   
       res.send({ status: true, newStock: product.stock });
     } catch (error) {
       console.log(error.message);
     }
 }
 
 
 const updateQuandity = async (req,res)=>{
    try {
       const userId = req.session.user_id;
       const productId = req.body.productId;
       const product = await Product.findOne({ _id: productId });
       const quantityChange = parseInt(req.body.quantityChange);
       if (!userId) {
         res.status(401).send({ status: false, message: "Unauthorized" });
         return;
       }
       let cart = await Cart.findOne({ user: userId });
   
       if (!cart) {
         res.status(404).send({ status: false, message: "Cart not found" });
         return;
       }
       const existingCartItem = cart.products.find(
         (item) => item.productId.toString() === productId
       );
   
       if (existingCartItem) {
         existingCartItem.quantity += quantityChange;
   
         if (existingCartItem.quantity < 1) {
           cart.products = cart.products.filter(
             (item) => item.productId.toString() !== productId
           );
         } else if (existingCartItem.quantity > product.stock) {
          // res.status(400).send({ status: false, message: "Quantity exceeds available stock" });
         } else {
           // Update the subtotal for the cart item
           existingCartItem.subtotal = existingCartItem.quantity * existingCartItem.price;
         }
       } else {
         // Add a new cart item with the given product ID and quantity
         const product = await Product.findById(productId);
         console.log( product+"**********************");
         const cartItem = {
           productId: product._id,
           quantity: 1,
           price: product.sales_price,
           subtotal: product.sales_price,
         };
         cart.products.push(cartItem);
       }
   
       const totalSubtotal = cart.products.reduce(
         (acc, item) => acc + item.subtotal
       );
   
       // console.log(totalSubtotal)
       await cart.save();
       res.send({ status: true, totalSubtotal });
     } catch (error) {
       console.log(error.message);
       res.status(500).send({ status: false, message: "Internal server error" });
     }
 }
 
 
 const removeCartItem = async (req,res)=>{
    try {
       const userId = req.session.user_id;
       const productId = req.body.productId;
   
       if (!userId) {
         res.status(401).send({ status: false, message: "Unauthorized" });
         return;
       }
       let cart = await Cart.findOne({ user: userId });
   
       if (!cart) {
         res.status(404).send({ status: false, message: "Cart not found" });
         return;
       }
       cart.products = cart.products.filter(
         (item) => item.productId.toString() !== productId
       );
   
       await cart.save();
       res.send({ status: true });
     } catch (error) {
       console.log(error.message);
       res.status(500).send({ status: false, message: "Internal server error" });
     }
 }
 
 
 const checkOut = async (req,res)=>{
    try {
     const userId = req.session.user_id;
     const UserData = await User.findById({ _id:userId});
     const addressData = await Address.find({ user_id: userId });
     const cart = await Cart.findOne({ user: UserData._id }).populate("products.productId");
     const wishlistCount = await wishListHelper.getWishListCount(userId);
     const walletDetails = await Wallet.findOne({ userId: userId }).lean();

     let couponError = false;
     let couponApplied = false;
     if (req.session.couponInvalidError) {
       couponError = req.session.couponInvalidError;
       delete req.session.couponInvalidError;
     } else if (req.session.couponApplied) {
       couponApplied = req.session.couponApplied;
       delete req.session.couponApplied;
     }
     
     const total = cart.products.reduce(
       (sum, product) => sum + Number(product.subtotal),
       0
    );

    let couponDiscount = 0;
    const eligibleCoupon = await couponHelpers.checkCurrentCouponValidityStatus(userId, total);
    if (eligibleCoupon.status) {
      couponDiscount = eligibleCoupon.couponDiscount;
  } else {
      couponDiscount = 0;
  }
  let TotalAmount  = total- couponDiscount
    
    let products = cart.products;
 
     if(userId){
       const isAuthenticated = true
       res.render("checkOut", {
        user:UserData,
         products:products,
          userAddresses:addressData,
          wishlistCount,          
          couponApplied,
          couponError,
          total:total,
          walletDetails,
          couponDiscount,
          TotalAmount:TotalAmount,
          isAuthenticated});
    }else{
       const isAuthenticated = false
       res.render("checkOut", {isAuthenticated});
    }
      
    } catch (error) {
       console.log(error);
    }
 }


 

 module.exports = {
    userCart,
    addToCart,
    updateQuandity,
    removeCartItem,
    checkOut,
   
 }