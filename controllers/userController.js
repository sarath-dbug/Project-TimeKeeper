const User = require('../models/usermodel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel')

let generatedOTP = '';
let globalEmail = '';

//register

const loadRegister = async (req, res) => {
   try {

      res.render('signup', { message: '', errMessage: '' })

   } catch (error) {
      console.log(error.message)
   }
}

const insertUser = async (req, res) => {
   console.log("insert user");
   try {
      const email = req.body.email
      const checkData = await User.findOne({ email: email });
      console.log('data', checkData);

      if (checkData) {
         res.render('signup', { errMessage: 'User already founded', message: '' });
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
            res.render('signup', { message: 'Registration Successfull Go and Login', errMessage: '' })
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
   try {

      const productData = await Product.find({})
      res.render('home', { products: productData });

   } catch (error) {
      console.log(error.message)
   }
}

// login user

const loadLogin = async (req, res) => {
   try {

      res.render('login', { message: '', errMessage: "" });

   } catch (error) {
      console.log(error.message);
   }
}

const verfiyUser = async (req, res) => {
   try {
      const email = req.body.email;
      const password = req.body.password;
      const productData = await Product.find({})

      const userData = await User.findOne({ email: email });
      if (userData) {
         if (userData.password === password) {
            req.session.user_id = userData._id
            res.render('home', { products: productData });
         } else {
            res.render('login', { message: '', errMessage: "Invalid email or password" });
         }
      } else {
         res.render('login', { message: '', errMessage: 'Invalid email or password' })
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
      console.log(productData);
      
      if (!productData) {
         return res.status(404).send('Product not found');
      }
    res.render('productDetails', {products: productData});
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
   loadProductDetails
}