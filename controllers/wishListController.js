const User = require('../models/usermodel');
const wishListHelper = require("../helpers/wishListHelper");
const wishListModel = require('../models/wishListModel')
const Product = require('../models/productModel')
const { ObjectId } = require("mongodb");


//wishList

const loadWishList = async (req, res) => {
    try {
      const userId = req.session.user_id;


      if (userId) {
      const userData = await User.findById({ _id: userId });
      const wishlistCount = await wishListHelper.getWishListCount(userId);
      const wishListProduct = await wishListHelper.getWishListProducts(userId);

       const isAuthenticated = true
       
       res.render("wishList", { user: userData, wishListProduct, wishlistCount ,isAuthenticated});
    } else {
       res.redirect('/login')
    }
  
    } catch (error) {
      console.log(error.message);
    }
  };
 
 
  const addToWishlist = async (req, res) => {
    try {
      const proId = req.body.proId;
      const userId = req.session.user_id;
      const quantity = req.body.quantity || 1; // Default quantity to 1 if not provided.

      const product = await Product.findById({_id:proId})
  
      const userWishList = await wishListModel.findOne({
        user: new ObjectId(userId),
      });
  
      if (userWishList) {
        const productExist = userWishList.wishList.find(
          (wishList) => wishList.productId == proId
        );
  
        if (productExist) {
          // If the product already exists in the wish list, update its quantity.
          productExist.quantity += quantity;
          productExist.subtotal = productExist.quantity * product.sales_price
          await userWishList.save();
          res.send({ status: true });
        } else {
          // If the product is not in the wish list, add it with the specified quantity.
          userWishList.wishList.push({
            productId: new ObjectId(proId),
            quantity: quantity,
            subtotal: product.sales_price
          });
          await userWishList.save();
          res.send({ status: true });
        }
      } else {
        // If the user doesn't have a wish list, create a new wish list.
        const wishListData = {
          user: new ObjectId(userId),
          wishList: [{ productId: new ObjectId(proId), quantity: quantity , subtotal: product.sales_price }],
        };
        const newWishList = new wishListModel(wishListData);
        await newWishList.save();
        res.send({ status: true });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: false, error: "Internal server error" });
    }
  };
  
 
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


 const updatewishQuandity = async (req,res)=>{
  try {
    
     const userId = req.session.user_id;
     const productId = req.body.productId;
     const product = await Product.findOne({ _id: productId });
     const quantityChange = parseInt(req.body.quantityChange);
     if (!userId) {
       res.status(401).send({ status: false, message: "Unauthorized" });
       return;
     }

     let wishlist = await wishListModel.findOne({ user: userId });
 
     if (!wishlist) {
       res.status(404).send({ status: false, message: "Cart not found" });
       return;
     }

     const existingwishItem = wishlist.wishList.find(
       (item) => item.productId.toString() === productId
     );

     console.log(existingwishItem +"iam here ***********");
 
     if (existingwishItem) {
       existingwishItem.quantity += quantityChange;
 
       if (existingwishItem.quantity < 1) {
         wishlist.wishList = wishlist.wishList.filter(
           (item) => item.productId.toString() !== productId
         );
       } else if (existingwishItem.quantity > product.stock) {

       } else {
         existingwishItem.subtotal = existingwishItem.quantity * product.sales_price;
       }
     } else {
  
       const product = await Product.findById(productId);

       const wishItem = {
         productId: product._id,
         quantity: 1,
         subtotal: product.sales_price,
       };
       wishlist.wishList.push(wishItem);
     }
 
    
     await wishlist.save();
   } catch (error) {
     console.log(error.message);
   }
}

 
 



 module.exports = {
    loadWishList,
    addToWishlist,
    removeProductWishlist,
    updatewishQuandity
 }