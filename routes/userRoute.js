const express = require('express')
const router = express()
const session = require("express-session");
const nocache = require("nocache");
const auth = require("../middleware/auth");
const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const wishlistController=require("../controller/wishlistController");
const forgotP=require("../controller/forgotPassword");


router.get('/', userController.getIndex)

router.get('/bestSellers', userController.getBestSeller)

router.get('/contact', userController.getContact)

router.get('/newArrivals', userController.getNewArrival)

router.get('/signUp', auth.isLogout, userController.getSignUp)

router.post('/signUp', userController.postSignup)

router.get('/signIn', auth.isLogout, userController.getSignin)

router.post('/signIn', userController.postSignIn)

router.post("/verifytwofact",userController.twoFactor)

router.get('/logOut', auth.isLogin, userController.postLogOut)

router.get("/loadShop",userController.loadShop);

router.get("/view-details",userController.loadDetails);

router.post("/otpPage",userController.verifyOtp);

router.post("/againotp",userController.againOtp);

//-------------------------------------

router.get("/forgotP",forgotP.loadForgotPassword);

router.post("/forgotP",forgotP.loadVeriftyForgotPassword);

router.post("/fnewPassword",forgotP.verifyOtp);

router.post("/resetP",forgotP.resetPassword)

router.get("/resendotp",forgotP.resendOtp);

//--------------------------------------

router.get("/addToCart",cartController.addToCart);

router.use(auth.isLogin);

router.get("/loadCart",cartController.loadCart);

router.post("/updateCart",cartController.updateCart);

router.get('/delete-cart',cartController.deleteCart)

router.get("/loadCheckout",userController.loadCheckout);

router.post("/applyCoupon",userController.applyCoupon);

router.get("/userProfile",userController.loadUserProfile);

router.post("/addAddress",userController.addNewAddress);

router.get("/delete-address",userController.deleteAddress);

router.get("/edit-address",userController.editAddress);

router.post("/edit-address",userController.editUpdateAddress);

router.get("/editUser",userController.editUser);

router.post("/editUser",userController.editUserUpdate);

router.get("/editcheckout-address",userController.editCheckoutAddress);

router.post("/editcheckout-address",userController.editUpdateCheckoutAddress);

router.get("/deletecheckout-address",userController.deleteCheckoutAddress)

router.post("/orderSuccess",userController.placeOrder);

router.get("/vieworder",userController.viewOrderDetails)

router.get("/cancelorder",userController.cancelOrder);

router.get("/returnOrder",userController.retunOrder);

router.get("/loadWishlist",wishlistController.loadWishlist);

router.get("/addWishlist",wishlistController.addWishlist);

router.get("/deleteWishlist",wishlistController.deleteWishlist)

router.get("/adCartremoveWishlist",wishlistController.addToCartremovefromwishlist)

router.get("/onlinePayment",userController.loadOrderSuccess);



router.get("*", (req, res) => {
    res.redirect("/")
  })
  
module.exports = router;