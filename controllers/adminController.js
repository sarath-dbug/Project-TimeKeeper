const admin = require('../models/adminModel');
const User = require('../models/usermodel')
const Order = require('../models/orderModel')
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



const userList = async (req,res)=>{
   try {
      const userData = await User.find({})
      res.render('userList',{user:userData})
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
const orderList = async (req,res)=>{
   try {
      const Orders = await Order.find();
      res.render("OrderList",{ userOrder:Orders});
   } catch (error) {
      console.log(error);
   }
}

const orderDetails = async (req,res)=>{
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

 const acceptReturn = async (req,res)=>{
   try {
      const id = req.query.id
      const order = await Order.findByIdAndUpdate(
         { _id: new ObjectId(id) },
         { $set: { status: "Returned" } },
         { new: true }
       ).exec();
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
   acceptReturn
}