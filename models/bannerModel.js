const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({

    name: {

        type: String,
        required: true
    },

    discription: {

        type: String,
        required: true
    },
    image: {

        type: String,
        required: true
    },

    unlist: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Bannner', bannerSchema)