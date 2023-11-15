const User = require('../models/usermodel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Refer = require('../models/referralModel')
const Wallet = require('../models/walletModel')
const Banner = require("../models/bannerModel");
const categoryOffer = require('../models/categoryOfferModel')
const wishListModel = require('../models/wishListModel')
const Cart = require('../models/cartModel')
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
   const isAuthenticated = false;
   try {
      if (req.body.otp !== generatedOTP) {
         return res.render('otpVerify', { errMessage: 'Invalid OTP', message: '', isAuthenticated });
      }

      const userData = new User({
         firstName: req.session.userData.firstName,
         lastName: req.session.userData.lastName,
         email: req.session.userData.email,
         password: req.session.userData.password,
         mobile: req.session.userData.mobile,
         referCode: generatedOTP
      });

      const savedUserData = await userData.save();

      if (savedUserData) {
         // Referer Update
         const userRefer = await User.findOne({ referCode: req.session.userData.refer });

         if (userRefer) {
            // Initialize variables for referrer and referee amounts
            const referAmt = await Refer.find();
            let totalReferrerAmount = 0;
            let totalRefereeAmount = 0;

            referAmt.forEach((entry) => {
               totalReferrerAmount += entry.referrer;
               totalRefereeAmount += entry.referee;
            });

            // Update the referrer's wallet
            const referrerWallet = await Wallet.findOne({ userId: userRefer._id });
            if (referrerWallet) {
               const referrerTransaction = {
                  status: "Referral",
                  amount: totalReferrerAmount,
                  debitOrCredit: "Credit"
               };
               const updateData = {
                  userId: userRefer._id,
                  walletAmount: referrerWallet.walletAmount += totalReferrerAmount,
                  transaction: [referrerTransaction]
               }
               await updateData.save();
            } else {
               const referrerTransaction = {
                  status: "Referral",
                  amount: totalReferrerAmount,
                  debitOrCredit: "Credit"
               };

               const newWallet = new Wallet({
                  userId: userRefer._id,
                  walletAmount: totalReferrerAmount,
                  transaction: [referrerTransaction]
               });
               await newWallet.save();
            }

            // Referee Update
            const userReferee = await User.findOne({ email: req.session.userData.email });

            if (userReferee) {
               const refereeTransaction = {
                  status: "Referral",
                  amount: totalRefereeAmount,
                  debitOrCredit: "Credit"
               };

               const refereeWallet = new Wallet({
                  userId: userReferee._id,
                  walletAmount: totalRefereeAmount,
                  transaction: [refereeTransaction]
               });
               await refereeWallet.save();
            }
         }

         return res.render('signup', { message: 'Registration Successful. Go and Login', errMessage: '', isAuthenticated });
      }
   } catch (error) {
      console.log(error.message);
      return res.render('signup', { errMessage: 'Error during registration', message: '', isAuthenticated });
   }
};





const sendOtp = async (req, res) => {
   console.log("OTP Send");
   try {

      const email = req.body.email
      const checkData = await User.findOne({ email: email });
      if (checkData) {
         res.render('signup', { errMessage: 'User already founded', message: '', isAuthenticated });
      } else {
         req.session.userData = req.body;
         console.log(req.session.userData);
      }


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

      const isAuthenticated = false
      res.render('otpVerify', { message: '', errMessage: '', isAuthenticated })
   } catch (error) {
      console.log(error.message);
   }
}




const resendOtp = async (req, res) => {
   console.log("OTP Send");
   try {
      const email = req.session.userData.email
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
      // Function to generate and send OTP
      function sendOTP() {
         generatedOTP = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

         req.session.generatedOTP = generatedOTP;

         const mailOptions = {
            from: my_Mail,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${generatedOTP}`,
         };
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

      const isAuthenticated = false
      res.render('otpVerify', { message: '', errMessage: '', isAuthenticated })
   } catch (error) {
      console.log(error.message);
   }
}



// home
const loadHome = async (req, res) => {
   if (req.session.user_id) {
      const isAuthenticated = true
      const productData = await Product.find({})
      const bannerData = await Banner.find();

      const userCart = await Cart.findOne({ user: req.session.user_id });
      let cartCount = 0
      if (userCart) {
         cartCount = userCart.products.length;
      }
      const userWishlist = await wishListModel.findOne({ user: req.session.user_id });
      let wishCount = 0;
      if (userWishlist) {
         wishCount = userWishlist.wishList.length;
      }



      res.render('home', { products: productData, Banners: bannerData, cartCount, wishCount, isAuthenticated });
   } else {
      const isAuthenticated = false
      const productData = await Product.find({})
      const bannerData = await Banner.find();

      res.render('home', { products: productData, Banners: bannerData, isAuthenticated });
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
      const bannerData = await Banner.find();

      const userData = await User.findOne({ email: email });
      if (userData) {
         if (userData.is_blocked === false) {
            if (userData.password === password) {
               req.session.user_id = userData._id
               res.redirect("/home")
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


//shop
const viewShop = async (req, res) => {
   try {

      var search = '';
      if (req.query.search) {
         search = req.query.search
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

            $or: [
               { name: { $regex: '.*' + search + '.*' } },
               { category: { $regex: '.*' + search + '.*' } }
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
         const userCart = await Cart.findOne({ user: req.session.user_id });
         let cartCount = 0
         if (userCart) {
            cartCount = userCart.products.length;
         }
         const userWishlist = await wishListModel.findOne({ user: req.session.user_id });
         let wishCount = 0;
         if (userWishlist) {
            wishCount = userWishlist.wishList.length;
         }
         res.render('shop', {
            isAuthenticated,
            user: userData,
            category: category,
            products: products,
            req: req,
            totalPages: totalPages,
            currentPage: currentPage,
            totalProducts: totalProducts,
            wishCount,
            cartCount
         });
      } else {
         const isAuthenticated = false
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



const loadProductDetails = async (req, res) => {

   try {
      const product_id = req.query.product_id;
      const productData = await Product.findOne({ _id: product_id });
      const categoryOfferData = await categoryOffer.findOne({ name: productData.category });

      if (!productData) {
         return res.status(404).send('Product not found');
      }
      if (req.session.user_id) {
         const isAuthenticated = true
         const exitWish = await wishListModel.findOne({ user: req.session.user_id, 'wishList.productId': product_id });
         const userCart = await Cart.findOne({ user: req.session.user_id });
         let cartCount = 0
         if (userCart) {
            cartCount = userCart.products.length;
         }
         const userWishlist = await wishListModel.findOne({ user: req.session.user_id });
         let wishCount = 0;
         if (userWishlist) {
            wishCount = userWishlist.wishList.length;
         }

         res.render('productDetails', { products: productData, categoryOffer: categoryOfferData, exitWish,cartCount,wishCount, isAuthenticated });
      } else {
         const isAuthenticated = false
         const exitWish = await wishListModel.findOne({ user: req.session.user_id, 'wishList.productId': product_id });
         res.render('productDetails', { products: productData, categoryOffer: categoryOfferData, exitWish, isAuthenticated });
      }

   } catch (error) {
      console.log(error.message);
   }
}



const searchProducts = async (req, res) => {
   try {
      let regex = req.body.regex;
      console.log("search result", regex);
      const products = await Product.find({
         $or: [
            { product_name: { $regex: regex, $options: "i" } },
            { category: { $regex: regex, $options: "i" } },
            { brand: { $regex: regex, $options: "i" } }
         ]
      });
      res.json({ products });
   } catch (error) {
      console.log(error.message);
   }
};


const loadAbout = async (req, res) => {
   try {
      if (req.session.user_id) {
         const isAuthenticated = true
         res.render('about', { isAuthenticated });
      } else {
         const isAuthenticated = false
         res.render('about', { isAuthenticated });
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
   viewShop,
   searchProducts,
   resendOtp,
   loadAbout
}