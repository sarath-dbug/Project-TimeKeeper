const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId:{
         type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    walletAmount:{
        type:Number,
        default:0
    },
    transaction: [{
        status: {
           type: String,
           required: true
        },
        amount: {
           type: Number,
           required: true
        },
        debitOrCredit: {
           type: String,
           enum: ['Debit', 'Credit'],
           required: true
        },
        date: {
         type: Date,
         default: Date.now 
       }
     }]
  
})

module.exports = mongoose.model('Wallet', walletSchema);