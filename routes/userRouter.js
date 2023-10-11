const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')
const userRouter = express();

const auth = require('../middleware/authentication')
const userController = require('../controllers/usercontroller');
const config = require('../config/config')
userRouter.use(nocache());
userRouter.use(session({
   secret:config.sessionSecretId,
   resave:false,
   saveUninitialized:false,
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

userRouter.get('/productDetails',userController.loadProductDetails);

module.exports = userRouter;       
