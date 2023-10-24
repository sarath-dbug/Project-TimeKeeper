const User = require('../models/usermodel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Category = require('../models/categoryModel')
const orderHelper = require("../helpers/orderHelper");
const Order = require('../models/orderModel')




let generatedOTP = '';
let globalEmail = '';

//register

const loadRegister = async (req, res) => {
   const isAuthenticated = false
   try {

      res.render('signup', { message: '', errMessage: '', isAuthenticated })

   } catch (error) {
      console.log(error.message)
   }
}

const insertUser = async (req, res) => {
   const isAuthenticated = false
   try {
      const email = req.body.email
      const checkData = await User.findOne({ email: email });
      console.log('data', checkData);

      if (checkData) {
         res.render('signup', { errMessage: 'User already founded', message: '', isAuthenticated });
      } else {
         if (req.body.otp !== generatedOTP) {
            res.render('signup', { errMessage: 'Invalid OTP', message: '', isAuthenticated })
         } else {
            const user = new User({
               firstName: req.body.firstName,
               lastName: req.body.lastName,
               email: req.body.email,
               password: req.body.password,
               mobile: req.body.mobile
            });

            const userData = await user.save();
            console.log(userData);
            if (userData) {
               res.render('signup', { message: 'Registration Successfull Go and Login', errMessage: '', isAuthenticated })
            }
         }

      }

   } catch (error) {
      console.log(error.message)
   }
}



const sendOtp = async (req, res) => {
   console.log("OTP Send");
   try {
      const email = req.body.mail;
      const my_Mail = "sarathpattambi2013@gmail.com";
      const my_password = "igqd kjgu mxfr noxm";

      const transporter = nodemailer.createTransport({
         host: 'smtp.gmail.com',
         port: 587,
         auth: {
            user: my_Mail,
            pass: my_password
         }
      });

      if (!email) {
         console.log("Email is missing");
         res.redirect(`/register?err=${true}&msg=Email is missing`);
      }

      // Function to generate and send OTP
      function sendOTP() {
         generatedOTP = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

         console.log("generatedOTP " + generatedOTP);
         req.session.generatedOTP = generatedOTP;
         console.log("Session Stored OTP " + req.session.generatedOTP);

         const mailOptions = {
            from: my_Mail,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${generatedOTP}`,
         };
         console.log(generatedOTP);

         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
               console.error('Error sending OTP:', error);
            } else {
               console.log('OTP sent:', info.response);
            }
         });

         // Invalidate the OTP after 1 minute
         setTimeout(() => {
            generatedOTP = null;
            console.log("OTP invalidated after 1 minute");
         }, 1 * 60 * 1000);
         // }
      }
      sendOTP();

   } catch (error) {
      console.log(error.message);
   }
}

// home
const loadHome = async (req, res) => {
   if (req.session.user_id) {
      const isAuthenticated = true
      const productData = await Product.find({})
      res.render('home', { products: productData, isAuthenticated });
   } else {
      const isAuthenticated = false
      const productData = await Product.find({})
      res.render('home', { products: productData, isAuthenticated });
   }

}


//shop
const viewShop = async (req,res)=>{
   try {

      var search='';
      if(req.query.search){
          search=req.query.search
      }

      const category = await Category.find()
      const userData = req.session.user_id ? await User.findById(req.session.user_id) : null;
      const perPage = 6;
      const currentPage = req.query.page ? parseInt(req.query.page) : 1;

      let products;
      if (req.query.category) {
        products = await Product.find({ category: req.query.category })
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      } else {
        products = await Product.find({
       
          $or:[
            {name:{$regex:'.*'+search+'.*'}},
            {category:{$regex:'.*'+search+'.*'}}
          ]
        })
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      }

      // Sorting
      if (req.query.sort === 'lowToHigh') {
         products.sort((a, b) => a.sales_price - b.sales_price);
       } else if (req.query.sort === 'highToLow') {
         products.sort((a, b) => b.sales_price - a.sales_price);
       }

       const totalProducts = await Product.countDocuments();
       const totalPages = Math.ceil(totalProducts / perPage);

      if (req.session.user_id) {
         const isAuthenticated = true
         res.render('shop', {
         isAuthenticated,
         user: userData,
         category: category,
         products: products,
         req: req,
         totalPages: totalPages,
         currentPage: currentPage,
         totalProducts: totalProducts,
          });
      } else {
         const isAuthenticated =false
         res.render('shop', {
         isAuthenticated,
         user: userData,
         category: category,
         products: products,
         req: req,
         totalPages: totalPages,
         currentPage: currentPage,
         totalProducts: totalProducts,
          });
       }
     } catch (error) {
      console.log(error);
   }
}


// login user

const loadLogin = async (req, res) => {
   const isAuthenticated = false
   try {
      res.render('login', { message: '', errMessage: "", isAuthenticated });
   } catch (error) {
      console.log(error.message);
   }
}

const verfiyUser = async (req, res) => {
   const isAuthenticated = false
   try {
      const email = req.body.email;
      const password = req.body.password;
      const productData = await Product.find({})

      const userData = await User.findOne({ email: email });
      if (userData) {
         if (userData.is_blocked === false) {
            if (userData.password === password) {
               const isAuthenticated = true
               req.session.user_id = userData._id
               res.render('home', { products: productData, isAuthenticated });
            } else {
               res.render('login', { message: '', errMessage: "Invalid email or password", isAuthenticated });
            }
         } else {
            res.render('login', { message: '', errMessage: 'Your account is currently blocked', isAuthenticated })
         }
      } else {
         res.render('login', { message: '', errMessage: 'Invalid email or password', isAuthenticated })
      }
   } catch (error) {
      console.log(error.message)
   }
}


const userLogout = async (req, res) => {
   try {
      req.session.user_id = null;
      res.redirect('/');
   } catch (error) {
      console.log(error.message);
   }
}


const loadProductDetails = async (req, res) => {

   try {
      const product_id = req.query.product_id;
      const productData = await Product.findOne({ _id: product_id });
      if (!productData) {
         return res.status(404).send('Product not found');
      }
      if (req.session.user_id) {
         const isAuthenticated = true
         res.render('productDetails', { products: productData, isAuthenticated });
      } else {
         const isAuthenticated = false
         res.render('productDetails', { products: productData, isAuthenticated });
      }

   } catch (error) {
      console.log(error.message);
   }
}


const userAccount = async (req, res) => {
   const userId = req.session.user_id
   const userData = await User.findOne({ _id: userId })
   try {
      if (userId) {
         const isAuthenticated = true
         res.render('Account', { users: userData, isAuthenticated })
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


const editPassword = async (req,res)=>{
   try {
      const userId = req.session.user_id
      const newPass = req.body.newPass;
      const confPass = req.body.confPass;
      console.log(newPass,confPass);

      if (newPass === confPass) {
         const result = await User.updateOne(
           { _id: userId },
           { $set: { password:confPass} }
         );
         res.redirect("/userAccount");
       }
   } catch (error) {
      console.log(error);
   }
}

const loadUserAddress = async (req,res)=>{
   try {
   const userId = req.session.user_id
   const userData = await User.findById({_id:userId})
   const userAddress = await Address.findOne({user_id:userId})

      if(userId){
         const isAuthenticated = true
         res.render('userAddress',{user:userData,userAddress,isAuthenticated})
      }else{
         const isAuthenticated = false
         res.render('userAddress',{user:userData,userAddress,isAuthenticated})
      }

   } catch (error) {
      console.log(error);
   }
}

const addAddress = async (req,res)=>{
   try {

      const userId = req.session.user_id
      const {name, mobile, homeAddress, city, street, postalCode} = req.body
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

      let userAddress= await Address.findOne({user_id:userId})
      if(!userAddress){
         newAddress.isDefault = true;
         userAddress = new Address({ user_id: userId, address: [newAddress] });
      }else{
         userAddress.address.push(newAddress);
      }
      const result = await userAddress.save();
      res.redirect('/userAddress');

   } catch (error) {
      console.log(error);
   }
}


const editAddress = async (req,res)=>{
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


const deleteAddress = async (req,res)=>{
   try {
      const Id = req.query.id
      const userId = req.session.user_id
      await Address.updateOne(
         { user_id: userId },
         { $pull: { address: {_id: Id } } }
       );
       res.redirect("/userAddress");
   } catch (error) {
      console.log(error);
   }
}


const loadOrderList = async (req,res)=>{
   try {
      const userId = req.session.user_id
      const userOrder = await Order.find({ user: userId }).populate("items.product").exec();
      console.log(userOrder)
      if(userId){
         const isAuthenticated = true
         res.render('userOrderList',{myOders: userOrder,isAuthenticated})
      }else{
         const isAuthenticated = false
       res.render('userOrderList',{myOders: userOrder,isAuthenticated})
      }

   } catch (error) {
      console.log(error);
   }
}

const viewOrder = async (req,res)=>{
   try {
      const orderId = req.query.orderId;
      const userId = req.session.user_id
      const order = await Order.findOne({ _id: orderId }).populate({ path: 'items.product',select: 'product_name sales_price image',})
    
      const orderDetails = order.items.map(item => {
         const image = item.product.image|| []; // Set images to an empty array if it is undefine                          
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
 
   if(userId){
      const isAuthenticated = true
      res.render('viewOrder',{
         orderDetails: orderDetails,
         deliveryAddress: deliveryAddress,
         total: total,
         orderId: orderId,
         order:order,
         isAuthenticated
     });
   }else{
      const isAuthenticated = false
      res.render('viewOrder',{
         orderDetails: orderDetails,
         deliveryAddress: deliveryAddress,
         total: total,
         orderId: orderId,
         order:order,
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

     // Update the order status to "Order Cancelled"
     order.status = "Order Cancelled";
     await order.save();
     return res.redirect("userOrderList"); // Redirect back to user's order list
   
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
    
    const total = cart.products.reduce(
      (sum, product) => sum + Number(product.subtotal),
      0
   );
   
   let products = cart.products;

    if(userId){
      const isAuthenticated = true
      res.render("checkOut", {user:UserData, products:products, userAddresses:addressData,total:total,isAuthenticated});
   }else{
      const isAuthenticated = false
      res.render("checkOut", {isAuthenticated});
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

       if (req.body["paymentMethod"] === "COD") {
         orderHelper.placingOrder(userId, orderDetails, orderedProducts, totalOrderValue).then(async (orderId, error) => {
         res.json({ COD_CHECKOUT: true });
           });
       }

      }else{
         res.json({ paymentStatus: false });
      }
      
   } catch (error) {
      console.log(error);
   }
}


const orderSuccess = async (req,res)=>{
   try {
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: userId });
    const orders = await Order.find({ user: userId }).exec();

    if(userId){
      const isAuthenticated = true
      res.render("orderSuccess", {user:userData,isAuthenticated});
   }else{
      const isAuthenticated = false
      res.render("orderSuccess", {user:userData,isAuthenticated});
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




module.exports = {
   loadRegister,
   insertUser,
   loadLogin,
   verfiyUser,
   loadHome,
   userLogout,
   sendOtp,
   loadProductDetails,
   userAccount,
   editInfo,
   editPassword,
   loadUserAddress,
   addAddress,
   editAddress,
   deleteAddress,
   loadOrderList,
   viewOrder,
   userCart,
   addToCart,
   updateQuandity,
   removeCartItem,
   checkOut,
   placeOrder,
   orderFailed,
   orderSuccess,
   cancelOrder,
   returnOrder,viewShop
}