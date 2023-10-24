const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  total: {
    type: Number,
   
  },
  couponDiscount:{
    type:Number,
    default:0
  },
  totalQuantity: {
    type: Number, // Store the total quantity as a number
    required: true,
    min: 1 // Assuming quantity should be at least 1
  },

  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Returned','Dispatched','Order Cancelled','Requested Return','Placed','Return declined'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  paymentMethod:{
    type:String,
    require:true
  },
  
  addressDetails:{
    name: {
      type:String,
      require:true
    
    },
    mobile:{
      type:String,
      require:true
    },
    homeAddress:{
      type:String,
      require:true
    },
    city:{
      type:String,
      require:true
    },
    street:{
      type:String,
      require:true
    },
    postalCode:{
      type:String,
      require:true
    }
  
  },

});

const Order = mongoose.model('Order', orderSchema);

module.exports=Order;