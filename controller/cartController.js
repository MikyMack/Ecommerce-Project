const User = require('../models/userModel')
const products = require("../models/productModel")
const coupon = require("../models/couponModel");



const loadCart = async (req, res) => {
    const uid = req.session.user_id;
    try {
        userSession = req.session.user_id;
        
        if (userSession) {
            console.log("cart loaded");
            const couponData = await coupon.find();
            const userData = await User.findById({ _id: userSession })
            const completeUser = await userData.populate('cart.item.productId')
            if (req.query.coupon) {
                coup = req.query.coupon
            } else {
                coup = 0;
            }
            res.render("users/cart", { user: req.session.user, cartProducts: completeUser.cart, coupon: couponData, reduction: coup, id: uid, message:"" });

        } else {
            res.redirect("/signIn");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        userSession = req.session.user_id;
        if (userSession) {
            const details = await products.findOne({ _id: productId })
            const product = await products.find({ category: details.category });
            const userData = await User.findById({ _id: userSession })
            const productData = await products.findById({ _id: productId })
            userData.addToCart(productData)
            res.redirect('/loadCart');
            // res.render('details',{ user: req.session.user,message:"product added to cart !",detail: details, related: product })

        } else {
            res.render('users/signIn')
        }
    } catch (error) {
        console.log(error)
    }
}

const updateCart = async (req, res) => {
    try {
        console.log("cart updated");
        let { quantity, _id } = req.body
        const userData = await User.findById({ _id: req.session.user_id })
        const productData = await products.findById({ _id: _id })
        const price = productData.price;
        let test = await userData.updateCart(_id, quantity)
        console.log(test);
        res.json({ test, price })

    } catch (error) {
        console.log(error)
    }
}

const deleteCart = async (req, res,) => {

    try {
        const productId = req.query.id
        userSession = req.session
        const userData = await User.findById({ _id: userSession.user_id })
        userData.removefromCart(productId)
        res.redirect('/loadCart')
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    loadCart,
    addToCart,
    deleteCart,
    updateCart,
}