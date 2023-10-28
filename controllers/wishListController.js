const User = require('../models/usermodel');
const wishListHelper = require("../helpers/wishListHelper");
const wishListModel = require('../models/wishListModel')
const { ObjectId } = require("mongodb");


//wishList

const loadWishList = async (req, res) => {
    try {
      const userId = req.session.user_id;
  
      const userData = await User.findById({ _id: userId });
      const wishlistCount = await wishListHelper.getWishListCount(userId);
  
      const wishListProduct = await wishListHelper.getWishListProducts(userId);
 
      if (userId) {
       const isAuthenticated = true
       res.render("wishList", { user: userData, wishListProduct, wishlistCount ,isAuthenticated});
    } else {
       const isAuthenticated = false
       res.render("wishList", { user: userData, wishListProduct, wishlistCount ,isAuthenticated});
    }
  
    } catch (error) {
      console.log(error.message);
      res.redirect("/user-error");
    }
  };
 
 
 const addToWishlist = async (req,res)=>{
    try {
       console.log("iammmmmmmmmmmmmm hereeeeeeeeeeeeeeeeeeeeeee");
       let proId = req.body.proId;
     let userId = req.session.user_id;
 
     let userWishList = await wishListModel.findOne({
       user: new ObjectId(userId),
     });
 
     if (userWishList) {
       let productExist = userWishList.wishList.findIndex(
         (wishList) => wishList.productId == proId
       );
 
       if (productExist != -1) {
         res.send({ status: false });
       } else {
         await wishListModel.updateOne(
           { user: new ObjectId(userId) },
           {
             $push: {
               wishList: { productId: new ObjectId(proId) },
             },
           }
         );
         res.send({ status: true });
       }
     } else {
       let wishListData = {
         user: new ObjectId(userId),
         wishList: [{ productId: new ObjectId(proId) }],
       };
       let newWishList = new wishListModel(wishListData);
       await newWishList.save();
       res.send({ status: true });
     }
    } catch (error) {
       console.log(error);
    }
 }
 
 const removeProductWishlist = async (req,res)=>{
    try {
       const userId = req.session.user_id;
       const proId = req.body.proId;
     
       wishListHelper.removeProductWishlist(proId, userId).then((response) => {
         res.send(response);
       });
    } catch (error) {
       console.log(error);
    }
 }



 module.exports = {
    loadWishList,
    addToWishlist,
    removeProductWishlist
 }