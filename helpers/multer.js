const path = require('path');
const multer = require('multer');

// Storage configuration for product images
const productStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/productsImages'));
   },
   filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
   }
});

// Multer instance for product images (accepts multiple files)
const productUpload = multer({ storage: productStorage });

// Storage configuration for banner images
const bannerStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/bannerImages'));
   },
   filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
   }
});

// Multer instance for banner images
const bannerUpload = multer({ storage: bannerStorage });

module.exports = {
   productUpload,
   bannerUpload
};
