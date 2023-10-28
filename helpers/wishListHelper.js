const wishListModel = require('../models/wishListModel')
const{ObjectId} = require('mongodb')


 //to get the total count of wishlist
 const getWishListCount = async (userId) => {
    try {
        const userWishlist = await wishListModel.findOne({ user: userId });
        let count = 0;
    
        if (userWishlist) {
          count = userWishlist.wishList.length;
      
        }
        return count;
      } catch (error) {
        console.log(error.message);
        throw error; // You should re-throw the error to propagate it to the caller.
      }
  }


  //to get wishlist
const getWishListProducts = async (userId) => {
    try {
      return new Promise((resolve, reject) => {
        wishListModel.aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$wishList",
          },
          {
            $project: {
              productId: "$wishList.productId",
              createdAt: "$wishList.createdAt",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "wishListed",
            },
          },
          {
            $project: {
              productId: 1,
              createdAt: 1,
              wishListed: { $arrayElemAt: ["$wishListed", 0] },
            },
          },
        ]).then((wishListed) => {
          resolve(wishListed);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const removeProductWishlist = async (proId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        wishListModel.updateOne(
          { user: userId },
          {
            $pull: { wishList: { productId: proId } },
          }
        ).then((response) => {
          console.log(response);
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports = {
    getWishListCount,
    getWishListProducts,
    removeProductWishlist
  }