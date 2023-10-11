

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/productsImages'), (err, success) => {
         if (err) {
            throw err
         }
      });
   },
   filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name, (err, success) => {
         if (err) {
            throw err
         }
      })
   }
})

const upload = multer({ storage: storage });

module.exports = upload;
