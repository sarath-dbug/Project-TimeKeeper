const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')
const userRouter = express();

const auth = require('../middleware/authentication')
const userController = require('../controllers/userController');
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

//user Account
userRouter.get('/userAccount',blocked.checkBocked,userController.userAccount);
userRouter.post('/editInfo',blocked.checkBocked,userController.editInfo);
userRouter.post('/editPassword',blocked.checkBocked,userController.editPassword);
userRouter.get('/userAddress',blocked.checkBocked,userController.loadUserAddress);
userRouter.post('/addAddress',blocked.checkBocked,userController.addAddress);
userRouter.post('/editAddress',blocked.checkBocked,userController.editAddress);
userRouter.get('/deleteAddress',blocked.checkBocked,userController.deleteAddress);
userRouter.get('/userOrderList',blocked.checkBocked,auth.isLogin,userController.loadOrderList);
userRouter.get('/viewOrder',blocked.checkBocked,userController.viewOrder);
userRouter.get('/cancelOrder',blocked.checkBocked,auth.isLogin,userController.cancelOrder);
userRouter.get('/returnOrder',blocked.checkBocked,userController.returnOrder);



//addTocart
userRouter.get('/userCart',blocked.checkBocked,userController.userCart);
userRouter.post('/addToCart/:id',blocked.checkBocked,auth.isLogin,userController.addToCart);
userRouter.post('/updateQuandity',blocked.checkBocked,userController.updateQuandity);
userRouter.post('/removeCartItem',blocked.checkBocked,userController.removeCartItem);
userRouter.get('/checkOut',blocked.checkBocked,userController.checkOut);
userRouter.post('/placeOrder',blocked.checkBocked,userController.placeOrder);
userRouter.get('/orderSucessfull',blocked.checkBocked,userController.orderSuccess);
userRouter.get('/orderFailed',blocked.checkBocked,userController.orderFailed);


module.exports = userRouter;       

