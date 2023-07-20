const mongoose = require("mongoose")
const Product = require('../models/productModel');
const staffsSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    staff_No:{
        type: Number,
        required : true
    },
    is_admin: {
        type: Number,
        required: true
    },
    is_verified: {
        type: Number,
        default: 1,
        required: true
    },

})

module.exports = mongoose.model('staff', staffsSchema)
