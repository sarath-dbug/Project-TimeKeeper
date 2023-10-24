const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId, // The type of the product field (e.g., String, ObjectId, etc.)
        ref:"product"
      },
      quantity: {
        type: Number,
        required: true,
        default: 1 // You can set a default value if needed
      },
      price:{
        type:Number,
        default:0
      },

      subtotal:{
        type:Number,
        default:0
      }
      
    }
  ]
  
});
module.exports = mongoose.model('Cart', cartSchema);