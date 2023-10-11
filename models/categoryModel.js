const mongoose = require('mongoose');

const categoryModel = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   blocked: {
      type: Boolean,
      default: false,
   }
})

module.exports = mongoose.model('category', categoryModel);