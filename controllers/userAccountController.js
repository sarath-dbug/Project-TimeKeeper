const User = require('../models/usermodel');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')
const Coupon = require('../models/couponModel')
const moment = require('moment');



//user Account
const userAccount = async (req, res) => {
   const userId = req.session.user_id
   const userData = await User.findOne({ _id: userId })
   const wallet = await Wallet.findOne({ userId: req.session.user_id });
   try {
      if (userId) {
         const isAuthenticated = true
         res.render('Account', { users: userData, wallet: wallet, isAuthenticated })
      } else {
         res.redirect('/login');
      }
   } catch (error) {
      console.log(error);
   }
}

const editInfo = async (req, res) => {
   try {
      const userId = req.session.user_id
      const { name, email, mobile } = req.body
      const result = await User.updateOne(
         { _id: userId },
         { $set: { firstName: name, email: email, mobile: mobile } }
      );
      res.redirect("/userAccount");
   } catch (error) {
      console.log(error);
   }
}


const editPassword = async (req, res) => {
   try {
      const userId = req.session.user_id
      const newPass = req.body.newPass;
      const confPass = req.body.confPass;
      console.log(newPass, confPass);

      if (newPass === confPass) {
         const result = await User.updateOne(
            { _id: userId },
            { $set: { password: confPass } }
         );
         res.redirect("/userAccount");
      }
   } catch (error) {
      console.log(error);
   }
}

const loadUserAddress = async (req, res) => {
   try {
      const userId = req.session.user_id
      const userData = await User.findById({ _id: userId })
      const userAddress = await Address.findOne({ user_id: userId })

      if (userId) {
         const isAuthenticated = true
         res.render('userAddress', { user: userData, userAddress, isAuthenticated })
      } else {
         const isAuthenticated = false
         res.render('userAddress', { user: userData, userAddress, isAuthenticated })
      }

   } catch (error) {
      console.log(error);
   }
}

const addAddress = async (req, res) => {
   try {

      const userId = req.session.user_id
      const { name, mobile, homeAddress, city, street, postalCode } = req.body
      const newAddress = {
         name: name,
         mobile: mobile,
         homeAddress: homeAddress,
         city: city,
         street: street,
         postalCode: postalCode,
         isDefault: false
      }
      console.log(newAddress);

      let userAddress = await Address.findOne({ user_id: userId })
      if (!userAddress) {
         newAddress.isDefault = true;
         userAddress = new Address({ user_id: userId, address: [newAddress] });
      } else {
         userAddress.address.push(newAddress);
      }
      const result = await userAddress.save();
      res.redirect('/userAddress');

   } catch (error) {
      console.log(error);
   }
}


const editAddress = async (req, res) => {
   try {
      const id = req.body.id;
      const name = req.body.name;
      const mobile = req.body.mobileNumber;
      const address = req.body.address;
      const city = req.body.city;
      const street = req.body.street;
      const pincode = req.body.pincode;

      const update = await Address.updateOne(
         { "address._id": id },
         {
            $set: {
               "address.$.name": name,
               "address.$.mobile": mobile,
               "address.$.homeAddress": address,
               "address.$.city": city,
               "address.$.street": street,
               "address.$.postalCode": pincode,
            },
         }
      );

      res.redirect("/userAddress");
   } catch (error) {
      console.log(error);
   }
}


const deleteAddress = async (req, res) => {
   try {
      const Id = req.query.id
      const userId = req.session.user_id
      await Address.updateOne(
         { user_id: userId },
         { $pull: { address: { _id: Id } } }
      );
      res.redirect("/userAddress");
   } catch (error) {
      console.log(error);
   }
}


const loadOrderList = async (req, res) => {
   try {
      const userId = req.session.user_id
      let userOrder = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate("items.product").exec();

      console.log(userOrder)
      if (userId) {
         const isAuthenticated = true
         res.render('userOrderList', { myOders: userOrder, isAuthenticated })
      } else {
         const isAuthenticated = false
         res.render('userOrderList', { myOders: userOrder, isAuthenticated })
      }

   } catch (error) {
      console.log(error);
   }
}

const viewOrder = async (req, res) => {
   try {
      const orderId = req.query.orderId;
      const userId = req.session.user_id
      const order = await Order.findOne({ _id: orderId }).populate({ path: 'items.product', select: 'product_name sales_price image', })

      const orderDetails = order.items.map(item => {
         const image = item.product.image || []; // Set images to an empty array if it is undefine                          
         const images = image.length > 0 ? image[0] : ''; // Take the first image from the array if it exists
         return {
            name: item.product.product_name,
            images: images,
            price: item.product.sales_price,
            total: item.price,
            quantity: item.quantity,
            status: order.status,

         };
      });

      const deliveryAddress = {
         name: order.addressDetails.name,
         homeAddress: order.addressDetails.homeAddress,
         city: order.addressDetails.city,
         street: order.addressDetails.street,
         postalCode: order.addressDetails.postalCode,
      };

      const subtotal = order.total;
      const total = order.total
      const date = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');


      if (userId) {
         const isAuthenticated = true
         res.render('viewOrder', {
            orderDetails: orderDetails,
            deliveryAddress: deliveryAddress,
            total: total,
            orderId: orderId,
            order: order,
            date: date,
            isAuthenticated
         });
      } else {
         const isAuthenticated = false
         res.render('viewOrder', {
            orderDetails: orderDetails,
            deliveryAddress: deliveryAddress,
            total: total,
            orderId: orderId,
            order: order,
            date: date,
            isAuthenticated
         });
      }
   } catch (error) {
      console.log(error);
   }
}

const viewInvoice = async (req,res)=>{
   try {
      const orderId = req.query.orderId;
      console.log(orderId+"orderId");
      const userId = req.session.user_id
      const order = await Order.findOne({ _id: orderId }).populate({ path: 'items.product', select: 'product_name sales_price image', })

      const orderDetails = order.items.map(item => {
         const image = item.product.image || [];                       
         const images = image.length > 0 ? image[0] : ''; 
         return {
            name: item.product.product_name,
            images: images,
            price: item.product.sales_price,
            total: item.price,
            quantity: item.quantity,
            status: order.status,

         };
      });

      const deliveryAddress = {
         name: order.addressDetails.name,
         homeAddress: order.addressDetails.homeAddress,
         city: order.addressDetails.city,
         street: order.addressDetails.street,
         postalCode: order.addressDetails.postalCode,
      };

      const subtotal = order.total;
      const total = order.total
      const date = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');


      if (userId) {
         const isAuthenticated = true
         res.render('viewInvoices', {
            orderDetails: orderDetails,
            deliveryAddress: deliveryAddress,
            total: total,
            orderId: orderId,
            order: order,
            date: date,
            isAuthenticated
         });
      } else {
         const isAuthenticated = false
         res.render('viewInvoices', {
            orderDetails: orderDetails,
            deliveryAddress: deliveryAddress,
            total: total,
            orderId: orderId,
            order: order,
            date: date,
            isAuthenticated
         });
      }
   } catch (error) {
      console.log(error);
   }
}

const cancelOrder = async (req, res) => {
   const orderId = req.query.orderId;
   try {
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      //insert amt wallet
      if ((order.paymentMethod === "ONLINE" || order.paymentMethod === "WALLET") && order.total > 0) {
         // Check if a wallet exists for the user
         const wallet = await Wallet.findOne({ userId: order.user }).exec();

         if (wallet) {
            // Wallet exists, increment the wallet amount
            const updatedWallet = await Wallet.findOneAndUpdate(
               { userId: order.user },
               {
                  $inc: { walletAmount: order.total },
                  $push: {
                     transaction: {
                        status: "Canceled Order", // You can set the appropriate status for increment
                        amount: order.total,
                        debitOrCredit: "Credit", // Assuming increment is a credit
                     },
                  },
               },

               { new: true }
            ).exec();

         } else {
            // Wallet doesn't exist, create a new wallet with the order value as the initial amount
            const newWallet = new Wallet({
               userId: order.user,
               walletAmount: order.total,
            });

            const createdWallet = await newWallet.save();
            console.log(createdWallet, "created new wallet with order value");
         }
      }


      // Update the order status to "Order Cancelled"
      order.status = "Order Cancelled";
      await order.save();
      return res.redirect("/userOrderList"); // Redirect back to user's order list

   } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Error cancelling order" });
   }
};



const returnOrder = async (req, res) => {
   const orderId = req.query.orderId;

   try {
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      // Update the order status to "Requested Return"
      order.status = "Requested Return";
      await order.save();
      return res.redirect("/userOrderList"); // Redirect back to user's order list

   } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Error requesting return" });
   }
};


const loadCoupon = async (req, res) => {
   try {

      const newCoupon = await Coupon.find()
      const userData = await User.findById({ _id: req.session.user_id });

      if (req.session.user_id) {
         const isAuthenticated = true;
         res.render('coupon', { user: userData, newCoupon, isAuthenticated })
      } else {
         const isAuthenticated = false;
         res.render('coupon', { user: userData, newCoupon, isAuthenticated })
      }

   } catch (error) {
      console.log(error);
   }
}


const loadWallet = async (req, res) => {
   try {

      const wallet = await Wallet.findOne({ userId: req.session.user_id });
      const userData = await User.findById({ _id: req.session.user_id });
      let userOrder = await Order.find({ user: req.session.user_id }).sort({ createdAt: -1 }).populate("items.product").exec();

      console.log(wallet + '***************');

      if (req.session.user_id) {
         const isAuthenticated = true;
         res.render('wallet', { wallet, userOrder, isAuthenticated })
      } else {
         const isAuthenticated = false;
         res.render('wallet', { wallet, userOrder, isAuthenticated })
      }

   } catch (error) {
      console.log(error);
   }
}

module.exports = {
   userAccount,
   editInfo,
   editPassword,
   loadUserAddress,
   addAddress,
   editAddress,
   deleteAddress,
   loadOrderList,
   viewOrder,
   cancelOrder,
   returnOrder,
   loadCoupon,
   loadWallet,
   viewInvoice
}