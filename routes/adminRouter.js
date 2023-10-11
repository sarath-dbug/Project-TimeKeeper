const express = require('express');
const adminRouter = express();

const nocache = require('nocache')
adminRouter.use(nocache())

const logger = require('morgan')
adminRouter.use(logger('dev'))

const config = require('../config/config');
const session = require('express-session');
adminRouter.use(session({
   secret:config.sessionSecretId,
   resave:false,
   saveUninitialized:false,
}))

const bodyParser = require('body-parser');
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

adminRouter.use(express.static('public'))
adminRouter.set('view engine','ejs')
adminRouter.set('views','./views/admin')
 
const adminController = require('../controllers/adminController')
const auth = require('../middleware/adminAuth');
const upload = require('../helpers/multer')

adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.post('/',adminController.verifyUser);
adminRouter.get('/home',auth.isLogin,adminController.loadhome);
adminRouter.get('/logout',auth.isLogin,adminController.logout);

adminRouter.get('/categories',auth.isLogin,adminController.categories);
adminRouter.post('/categories',auth.isLogin,adminController.addCategories);
adminRouter.post('/editCategory',auth.isLogin, adminController.editCategory);
adminRouter.post('/toggleBlockStatus/:categoryId',auth.isLogin, adminController.toggleBlockStatus);

adminRouter.get('/addProduct',auth.isLogin,adminController.product);
adminRouter.post('/addProduct',upload.array('images'),adminController.addProduct);
adminRouter.get('/productList',auth.isLogin,adminController.productList) 
adminRouter.post('/toggleBlockStatusProducts/:productId',auth.isLogin, adminController.toggleBlockStatusProducts);
adminRouter.get('/editProduct',auth.isLogin,adminController.editProduct)
adminRouter.post('/editProduct/:productId',upload.array('images'),auth.isLogin,adminController.editProductAdd)

adminRouter.get('/userList',auth.isLogin,adminController.userList)
adminRouter.post('/toggleBlockStatusUser/:userId',auth.isLogin, adminController.toggleBlockStatusUser);
adminRouter.post('/searchUser',auth.isLogin,adminController.searchUser);












// adminRouter.get('*',(req,res)=>{res.redirect('/admin')})

module.exports = adminRouter;