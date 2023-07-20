const sms = require('../middleware/smsValidation');
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const { updateImage } = require('./productController');



const loadForgotPassword = async (req, res) => {
    try {
        res.render('users/forgotpassword')
    } catch (error) {
        console.log(error.message);
    }
}

const loadVeriftyForgotPassword = async (req, res) => {

    console.log("kikikiiii");
    const user = await User.find();
    mobile = req.body.mobnumber;
    console.log(user);
    const userDetails = await User.findOne({ mobile: mobile })
    if (userDetails) {
        try {
            newOtp = sms.sendMessage("+91"+mobile, res);
            console.log(newOtp);
            res.render("users/forgetPasswordVOtp", { mobile: mobile, newOtp: newOtp })
        } catch (error) {
            console.log(error.message);
        }
    } else {
        res.render("users/signIn", { message: "Please enter a valid number!!", user: req.session.user });
    }
}

const resendOtp = async (req, res) => {
    try {
        console.log(mobile);
        newOtp = sms.sendMessage("+91"+mobile, res);
        res.render("users/forgetPasswordVOtp", { mobile: mobile, newOtp: newOtp });
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req, res) => {
    try {
        const newOtp = await req.body.newOtp;
        const enteredOtp = await req.body.eotp;
        if (enteredOtp == newOtp) {
            const mobilenumber = await req.body.mobile;
            res.render("users/newPassword", { mobilenumber: mobilenumber });
        } else {
            res.render("users/signIn", { message: "Otp failed!!", user: req.session.user });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const resetPassword = async (req, res) => {
  const uid =req.session.user_id ;
    try {
        const phoneNumber = req.body.mobilenumber;
        const newPassword = req.body.Password;
        const secure_password = await bcrypt.hash(newPassword, 10)
        const updatedData = await User.updateOne({ mobile: phoneNumber }, { $set: { password: secure_password } })
        console.log(updatedData);
        if (updatedData) {
            res.status(200).render("users/signIn", { message: "password reset succsefullly", user: req.session.user ,id:uid})
        } else {
            res.render("users/signIn", { message: "verification failed", user: req.session.user , id:uid});
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadForgotPassword,
    loadVeriftyForgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp,
}