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
   saveUninitialized:true
}))

const bodyParser = require('body-parser');
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}));

adminRouter.use(express.static('public'))
adminRouter.set('view engine','ejs')
adminRouter.set('views','./views/admin')
 
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const brandsController = require('../controllers/brandController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')


const auth = require('../middleware/adminAuth');
const upload = require('../helpers/multer');

adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.post('/',adminController.verifyUser);
adminRouter.get('/home',auth.isLogin,adminController.loadhome);
adminRouter.get('/logout',auth.isLogin,adminController.logout);

//category
adminRouter.get('/categories',auth.isLogin,categoryController.categories);
adminRouter.post('/categories',auth.isLogin,categoryController.addCategories);
adminRouter.post('/editCategory',auth.isLogin,categoryController.editCategory);
adminRouter.post('/toggleBlockStatus/:categoryId',auth.isLogin,categoryController.toggleBlockStatus);

//brand
adminRouter.get('/brands',auth.isLogin,brandsController.brands);
adminRouter.post('/brands',auth.isLogin,brandsController.addBrands);
adminRouter.post('/editBrand',auth.isLogin,brandsController.editBrand);
adminRouter.post('/toggleBlockStatusbrand/:brandId',auth.isLogin,brandsController.toggleBlockStatusbrand);

//product
adminRouter.get('/addProduct',auth.isLogin,productController.product);
adminRouter.post('/addProduct',upload.productUpload.array('images'),productController.addProduct);   
adminRouter.get('/productList',auth.isLogin,productController.productList) 
adminRouter.post('/toggleBlockStatusProducts/:productId',auth.isLogin,productController.toggleBlockStatusProducts);
adminRouter.get('/editProduct',auth.isLogin,productController.editProduct)
adminRouter.post('/editProduct/:productId',upload.productUpload.array('images'),auth.isLogin,productController.editProductAdd)
adminRouter.get('/removeImage',auth.isLogin,productController.removeImage)

//user
adminRouter.get('/userList',auth.isLogin,adminController.userList)
adminRouter.post('/toggleBlockStatusUser/:userId',auth.isLogin, adminController.toggleBlockStatusUser);
adminRouter.post('/searchUser',auth.isLogin,adminController.searchUser);

//order
adminRouter.get('/orderList',auth.isLogin,adminController.orderList);
adminRouter.get('/orderDetails',auth.isLogin,adminController.orderDetails);
adminRouter.get('/updateStatus',adminController.updateStatus);
adminRouter.get('/acceptReturn',adminController.acceptReturn);
adminRouter.get('/DeclineReturn/:orderId',adminController.DeclineReturn);


//coupon
adminRouter.get('/addCoupon',auth.isLogin,couponController.loadAddCoupon);
adminRouter.post('/addCoupon',auth.isLogin,couponController.addCoupon);
adminRouter.get('/couponList',couponController.couponList);
adminRouter.get('/editCoupon',auth.isLogin,couponController.editCoupon)
adminRouter.post('/editCoupon/:couponId',auth.isLogin,couponController.editCouponAdd)
adminRouter.post('/toggleBlockStatusCoupons/:couponId',auth.isLogin,couponController.toggleBlockStatusCoupons)


//Banner
adminRouter.get('/addBanner',bannerController.loadAddBanner);
adminRouter.post('/addBanner',upload.bannerUpload.single('image'),auth.isLogin,bannerController.addBanner);
adminRouter.get('/bannerList',bannerController.bannerList);
adminRouter.get('/listBanner',bannerController.listBanner);
adminRouter.get('/unlistBanner',bannerController.unlistBanner);
adminRouter.get('/editBanner',bannerController.loadEditBanner);
adminRouter.post('/editBanner/:bannerId',upload.bannerUpload.single('image'),bannerController.editBanner);



//referralOffer
adminRouter.get('/referralOffer',auth.isLogin,adminController.loadReferralOffer);
adminRouter.post('/editReferral',auth.isLogin,adminController.editReferral);








// adminRouter.get('*',(req,res)=>{res.redirect('/admin')})

module.exports = adminRouter;