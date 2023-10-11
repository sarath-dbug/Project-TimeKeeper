const mongoose = require('mongoose');

const adminModel = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   mobile: {
      type: Number,
      required: true
   },
   email: {
      type: String,
      required: true
   },
   password: {
      type: String,
      requird: true
   }
})

module.exports = mongoose.model('admin', adminModel);