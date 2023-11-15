const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   firstName: {
      type: String,
      required: true,
   },
   lastName: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
   },
   password: {
      type: String,
      required: true
   },
   referCode: {
      type: String,
      required: true,
   },
   mobile: {
      type: Number,
      required: true,
   },
   is_admin: {
      type: Boolean,
      default: false,
   },
   is_blocked: {
      type: Boolean,
      default: false
   }
})

module.exports = mongoose.model('users', userSchema);
