const User = require('../models/usermodel');
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Order= require('../models/orderModel')
const mongoose = require('mongoose');





module.exports={

getProductListForOrders:async(userId)=>{

    return new Promise(async(resolve,reject)=>{

        try{
            const ProductDetails=await Cart.findOne({user:userId}).lean()

            const subtotal=ProductDetails.products.reduce((acc,product)=>{
                return acc+product.subtotal;
            },0);

            const products=ProductDetails.products.map((product)=>({
                product:product.productId,
                quantity:product.quantity,
                price:product.subtotal
            }))

            if(products){
                resolve(products)
            }
            else{
             resolve(false)
            }
        }
        catch(error){
            reject(error)
        }
    })
},


getCartValue: (userId) => {

    return new Promise(async (resolve, reject) => {
        try {
            const productDetails = await Cart.findOne({ user: userId }).lean();
            // Calculate the new subtotal for all products in the cart
            const subtotal = productDetails.products.reduce((acc, product) => {
                return acc + product.subtotal;
            }, 0);

            if (subtotal) {
                resolve(subtotal)
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error)
        }      
    })
},


placingOrder: async (userId, orderData, orderedProducts, totalOrderValue ) => {
    return new Promise(async (resolve, reject)=>{
        try {

            let orderStatus
            console.log('Ordered Producttss',orderedProducts)

            if (orderData['paymentMethod'] === 'COD') {
                orderStatus = 'Placed'
            } 
            else if (orderData['paymentMethod'] === 'WALLET') {
                orderStatus = 'Placed'
            }
            else {
                orderStatus = 'Pending'
            }
            // Calculate the total quantity of ordered products
             let totalQuantity = orderedProducts.reduce((total, product) => total + product.quantity, 0);
            console.log('orderrrr dataaaaaa',orderData)
            const orderDetails = new Order({
                user: userId,
                date: Date(),
                orderValue: totalOrderValue,
                // couponDiscount: orderData.couponDiscount,
                paymentMethod:orderData['paymentMethod'],
                status: orderStatus,
                items: orderedProducts,
                addressDetails: orderData,
                total:totalOrderValue,
                totalQuantity:totalQuantity
            });
    
            const placedOrder = await orderDetails.save();
    
            // console.log(placedOrder, 'placedOrder');
    
            // Remove the products from the cart
            await Cart.deleteMany({ user: userId });
    
            let dbOrderId = placedOrder._id.toString();
            console.log(dbOrderId, 'order id in stringggggggggggg');
            
            resolve(dbOrderId)
        } catch (error) {
            reject(error)
        }
    })

},




}