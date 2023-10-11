
const mongoose = require("mongoose")

const productmodel = new mongoose.Schema({
    product_name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    brand: {
        type: String,
        require: true
    },
    color: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    regular_price: {
        type: Number,
        require: true
    },
    sales_price: {
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    image: {
        type: Array,
        require: true
    }
})

module.exports = mongoose.model("product", productmodel)