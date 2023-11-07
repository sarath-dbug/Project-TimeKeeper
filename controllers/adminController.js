const admin = require('../models/adminModel');
const User = require('../models/usermodel')
const Order = require('../models/orderModel')
const Wallet = require('../models/walletModel')
const Refer = require('../models/referralModel')
const { ObjectId } = require('mongoose').Types;


const loadLogin = async (req, res) => {
   try {
      const err = req.query.err;
      const msg = req.query.msg;
      console.log(typeof err);
      if (err) {
         res.render('login', { message: '', errMessage: msg })
      } else {
         res.render('login', { message: msg, errMessage: '' })
      }
   } catch (error) {
      console.log(error.message);
   }
}

const verifyUser = async (req, res) => {
   try {
      const email = req.body.email;
      const password = req.body.password;
      const adminData = await admin.findOne({ email: email });
      console.log(adminData);

      if (adminData) {
         if (adminData.password === password) {
            req.session.admin_id = adminData._id;
            res.render('home');
         } else {
            res.redirect(`/admin/?err=${true}&msg=Invalid Password`);
         }
      } else {
         res.redirect(`/admin/?err=${true}&msg=Invalid Email`);
      }
   } catch (error) {
      console.log(error.message);
   }
}

const loadhome = async (req, res) => {
   try {
      if (req.session.admin_id) {
         res.render('home');
      } else {
         res.redirect('/admin')
      }
   } catch (error) {
      console.log(error.message)
   }
}

const logout = async (req, res) => {
   try {
      req.session.admin_id = null;
      res.redirect('/admin')
   } catch (error) {
      console.log(error.message)
   }
}



const userList = async (req, res) => {
   try {
      const userData = await User.find({})
      res.render('userList', { user: userData })
   } catch (error) {
      console.log();
   }
}

const toggleBlockStatusUser = async (req, res) => {
   try {
      const userId = req.params.userId;
      const blockStatus = req.body.blocked;
      const userData = await User.findById(userId);
      if (!userData) {
         return res.status(404).json({ message: 'Category not found' });
      } else {
         userData.is_blocked = blockStatus;
         await userData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }
   } catch (error) {
      console.log(error);
   }
}

const searchUser = async (req, res) => {
   try {
      const searchInput = (req.body.name);
      const usersData = await User.find({
         $or: [
            { first_name: { $regex: searchInput, $options: 'i' } },
            { last_name: { $regex: searchInput, $options: 'i' } },
            { display_name: { $regex: searchInput, $options: 'i' } },
            { email: { $regex: searchInput, $options: 'i' } }
         ]
      }).sort({ name: 1 });
      res.render('userList', { user: usersData });
   } catch (error) {
      console.log(error.message)
   }
}



//orderList -------

const orderList = async (req, res) => {
   try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.render("OrderList", { userOrder: orders });
   } catch (error) {
      console.log(error);
   }
}


const orderDetails = async (req, res) => {
   try {
      const id = req.query.id;
      const userOrder = await Order.findById({ _id: id }).populate("items.product").exec();
      res.render("orderDetails", { order: userOrder });
   } catch (error) {
      console.log(error);
   }
}

const updateStatus = async (req, res) => {
   const { id, status } = req.query;
   try {
      const order = await Order.findById(id);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      // Update the order status
      order.status = status;
      await order.save();

      return res.redirect("/admin/orderList"); // Redirect back to order list page
   } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Error updating order status" });
   }
};

const acceptReturn = async (req, res) => {
   try {
      const id = req.query.id
      const order = await Order.findByIdAndUpdate(
         { _id: new ObjectId(id) },
         { $set: { status: "Returned" } },
         { new: true }
      ).exec();

      // Check if the payment method is online and the order value is greater than 0
      if ((order.paymentMethod === "ONLINE" || order.paymentMethod === "WALLET" || order.paymentMethod === "COD") && order.total > 0) {
         // Check if a wallet exists for the user
         const wallet = await Wallet.findOne({ userId: order.user }).exec();

         if (wallet) {
            // Wallet exists, increment the wallet amount
            const updatedWallet = await Wallet.findOneAndUpdate(
               { userId: order.user },
               { $inc: { walletAmount: order.total },
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




      res.redirect('/admin/orderList')
   } catch (error) {
      console.log(error);
   }
}


const DeclineReturn = async (req, res) => {
   try {

      const orderId = req.params.orderId;

      const order = await Order.findById(orderId);
      console.log(order);

      order.status = 'Return declined';
      await order.save();

      res.redirect("/admin/orderList");
   } catch (error) {
      console.log(error.message);
   }
};


const loadReferralOffer = async (req, res) => {
   try {
      const userData = await User.find({})
      const referralData = await Refer.find({})
      console.log(referralData + "*********");

      res.render('referralOffer', { userData, refer: referralData })

   } catch (error) {
      console.log(error.message)
   }
}

const editReferral = async (req, res) => {
   try {

      const referId = req.query.referId;

      const referData = await Refer.findOne({ _id: referId })
      console.log(referData + "**********");
      const userData = await User.find({})

      const referralData = {
         referrer: req.body.referrer,
         referee: req.body.referee
      }

      console.log(referralData + "**********");

      if (referData) {
         const couponAdd = await Refer.findByIdAndUpdate(
            { _id: referId },
            { $set: referralData }
         );
      } else {

         const newreferral = new Refer({
            referrer: 100,
            referee: 100
         });

         const createdReferal = await newreferral.save();

      }

      const referraldata = await Refer.find()


      res.render('referralOffer', { refer: referraldata, userData })
   } catch (error) {
      console.log(error);
   }
}







module.exports = {
   loadLogin,
   verifyUser,
   logout,
   loadhome,
   userList,
   toggleBlockStatusUser,
   searchUser,
   orderList,
   orderDetails,
   updateStatus,
   DeclineReturn,
   acceptReturn,
   loadReferralOffer,
   editReferral,
   
}