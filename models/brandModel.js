const mongoose = require('mongoose');

const brandModel = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   blocked: {
      type: Boolean,
      default: false,
   }
})

module.exports = mongoose.model('brand', brandModel);