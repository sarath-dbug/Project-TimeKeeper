const User = require('../models/usermodel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const wishListHelper = require("../helpers/wishListHelper");
const wishListModel = require('../models/wishListModel')
const { ObjectId } = require("mongodb");



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









module.exports = {
   loadRegister,
   insertUser,
   loadLogin,
   verfiyUser,
   loadHome,
   userLogout,
   sendOtp,
   loadProductDetails,
   viewShop,
}