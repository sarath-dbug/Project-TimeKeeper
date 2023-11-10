const mongoose = require('mongoose');

const categoryOfferSchema =  new mongoose.Schema({

    name:{
        type:String,
        required:false
    },
    price:{
        type:Number,
        required:true
    }

})

module.exports = mongoose.model('categoryOffer', categoryOfferSchema)
