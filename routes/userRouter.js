const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')
const userRouter = express();


const auth = require('../middleware/authentication')
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const userAccountController = require('../controllers/userAccountController');
const wishListController = require('../controllers/wishListController');
const orderController = require('../controllers/orderController');
const blocked = require('../middleware/blocked')


const config = require('../config/config')
userRouter.use(nocache());
userRouter.use(session({
   secret:config.sessionSecretId,
   resave:false,
   saveUninitialized:true
}))


userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended:true}));
userRouter.use(logger('dev'))
userRouter.set('view engine','ejs');
userRouter.set('views','./views/users');


//home
userRouter.get('/',auth.isLogout, userController.loadHome);
// registration user
userRouter.get('/register',auth.isLogout,userController.loadRegister);
userRouter.post('/register',userController.insertUser);
userRouter.post('/send-otp',auth.isLogout,userController.sendOtp)
// login user
userRouter.get('/login',auth.isLogout,userController.loadLogin);
userRouter.post('/login',auth.isLogout,userController.verfiyUser);

userRouter.get('/home',auth.isLogin,userController.loadHome);
userRouter.get('/logout',auth.isLogin,userController.userLogout);
userRouter.get('/productDetails',blocked.checkBocked,userController.loadProductDetails);
userRouter.get('/shop',blocked.checkBocked,userController.viewShop);


//userAccount
userRouter.get('/userAccount',blocked.checkBocked,userAccountController.userAccount);
userRouter.post('/editInfo',blocked.checkBocked,userAccountController.editInfo);
userRouter.post('/editPassword',blocked.checkBocked,userAccountController.editPassword);
userRouter.get('/userAddress',blocked.checkBocked,userAccountController.loadUserAddress);
userRouter.post('/addAddress',blocked.checkBocked,userAccountController.addAddress);
userRouter.post('/editAddress',blocked.checkBocked,userAccountController.editAddress);
userRouter.get('/deleteAddress',blocked.checkBocked,userAccountController.deleteAddress);
userRouter.get('/userOrderList',blocked.checkBocked,auth.isLogin,userAccountController.loadOrderList);
userRouter.get('/viewOrder',blocked.checkBocked,userAccountController.viewOrder);
userRouter.get('/cancelOrder',blocked.checkBocked,auth.isLogin,userAccountController.cancelOrder);
userRouter.get('/returnOrder',blocked.checkBocked,userAccountController.returnOrder);
userRouter.get('/coupons',blocked.checkBocked,userAccountController.loadCoupon);


//addTocart
userRouter.get('/userCart',blocked.checkBocked,cartController.userCart);
userRouter.post('/addToCart/:id',blocked.checkBocked,auth.isLogin,cartController.addToCart);
userRouter.post('/updateQuandity',blocked.checkBocked,cartController.updateQuandity);
userRouter.post('/removeCartItem',blocked.checkBocked,cartController.removeCartItem);
userRouter.get('/checkOut',blocked.checkBocked,cartController.checkOut);
//order
userRouter.post('/placeOrder',blocked.checkBocked,orderController.placeOrder);
userRouter.get('/orderSucessfull',blocked.checkBocked,orderController.orderSuccess);
userRouter.get('/orderFailed',blocked.checkBocked,orderController.orderFailed);
userRouter.post('/verify-payment',blocked.checkBocked,orderController.verifyPayment);
userRouter.get('/wallet-placed',blocked.checkBocked,orderController.walletOrder);
userRouter.post('/apply-coupon-request',blocked.checkBocked,orderController.applyCoupon);




//wishList
userRouter.get('/wishList',blocked.checkBocked,wishListController.loadWishList);
userRouter.post('/addToWishlist',auth.isLogin,blocked.checkBocked,wishListController.addToWishlist);
userRouter.delete('/removeProductWishlist',blocked.checkBocked,wishListController.removeProductWishlist);




module.exports = userRouter;       

