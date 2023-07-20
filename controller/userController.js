const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const Category = require("../models/category");
const products = require("../models/productModel")
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const sms = require('../middleware/smsValidation');
const coupon = require("../models/couponModel");
const banner = require("../models/bannerModel");
const RazorPay = require("razorpay");
const category = require('../models/category');
require("dotenv").config();

// const securePassword = async (password) => {
//     try {
//         const passwordHash = await bcrypt.hash(password,10);
//         return passwordHash;
//     }
//     catch (error) {
//         console.log(error.message)
//     }
//   }


const getIndex = async (req, res) => {
    const id = req.session.user_id;
    const categories = await Category.find();
    const product = await products.find({ isAvailable: 1 });
    const banners = await banner.findOne({ is_active: 1 });
  
    try {
      res.render("users/index", { product: product, banner: banners, id: id, categories: categories });
    } catch (err) {
      console.log(err.message);
    }
  };
  
  

const getBestSeller = (req,res)=>{
    const id =req.session.user_id ;
    res.render("users/bestSellers",{id:id})
  }

const getContact =(req,res)=>{
    const id =req.session.user_id ;
    res.render("users/contact",{id:id})
  }

const getNewArrival = (req,res)=>{
    const id =req.session.user_id ;
    res.render("users/newArrivals",{id:id})
  }

  const getSignUp = (req,res)=>{
    try {
      res.render('users/signUp')
    }
    catch (error) {
      console.log(error.message)
    }
  }

  const getSignin = (req,res)=>{
    res.render("users/signIn")
  }

  let user;
  const postSignup = async(req,res)=>{
    const verify = await User.findOne({ $or: [{ mobile: req.body.mno }, { email: req.body.email }] });
    if (verify) {
        console.log(verify);
        res.render('users/signUp', { user: req.session.user, message: "user already exists!" })
    } else {
        const spassword = await bcrypt.hash(req.body.password, 10);
        user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            password: spassword,
            is_admin: 0,
        });
        mob="+91"+ req.body.mno;
        console.log(user);
        newOtp = sms.sendMessage(mob);
        console.log(newOtp);
        res.render("users/otpPage", { otp: newOtp, mobno: req.body.mno })
        
    }
  }

  const postSignIn = async(req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const userData = await User.findOne({ email: email, is_admin: 0 });
      if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password)

          if (passwordMatch) {
              if (userData.is_verified) {
                 
                  newOtp =  sms.sendMessage(("+91"+userData.mobile),res)
                  console.log(newOtp);
                  res.render('users/twoFactor', { otp: newOtp, userData: userData });
              } else {
                  res.render('users/signIn', { message: 'you are blocked by administrator', user: req.session.user })

              }
          }

          else {
              res.render('users/signIn', { message: 'email and password are incorrect', user: req.session.user })
          }
      }
      else {
          res.render('users/signIn', { message: 'email and password are incorrect', user: req.session.user })
      }



  }
  catch (error) {
      console.log(error.message);
  }
  }

  const twoFactor = async (req, res) => {
    try {
        if (req.query.id == req.body.otp) {
            const categories=await Category.find()
            const banners = await banner.findOne({ is_active: 1 });
            const product = await products.find({ isAvailable: 1 });
            const userid = req.body.userDataid;
            const username = req.body.userDataname;
            req.session.user_id = userid;
            req.session.user = username;
            req.session.user1 = true
            res.render('users/index', { user: req.session.user, product: product,banner:banners, id:req.session.user_id ,categories:categories});
        }
        
        else {
            res.render('users/signIn', { message: "incorrect otp!", user: req.session.user})
        }
    } catch (error) {
        console.log(error.message);
    }
};


  const postLogOut = (req, res) => {
    try {
          req.session.destroy();
          res.redirect('#');
    }
    catch (error) {
      console.log(error.message)
    }
  }

  const loadShop = async (req, res,next) => {
    console.log("shop loaded");
    const uid = req.session.user_id;
    try {
        const categoryData = await Category.find()
        let { search, sort, category, limit, page, ajax } = req.query
        if (!search) {
            search = ''
        }
        skip = 0
        if (!limit) {
            limit = 15
        }
        if (!page) {
            page = 0
        }
        skip = page * limit
        let arr = []
        if (category) {
            for (i = 0; i < category.length; i++) {
                    arr = [...arr, categoryData[category[i]].name]
            }
        } else {
            category = []
            arr = categoryData.map((x) => {
                if(x.is_available === 1){
                    return x.name
                }
            })
        }
        if (sort == 0) {
            productData = await products.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] },{isAvailable:1}] }).sort({ $natural: -1 })
            pageCount = Math.floor(productData.length / limit)
            if (productData.length % limit > 0) {

                pageCount += 1
            }
            productData = await products.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] },{isAvailable:1}] }).sort({ $natural: -1 }).skip(skip).limit(limit)

        } else {
            productData = await products.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] }] }).sort({ price: sort })
            pageCount = Math.floor(productData.length / limit)
            if (productData.length % limit > 0) {
                pageCount += 1
            }
            
            productData = await products.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] }] }).sort({ price: sort }).skip(skip).limit(limit)
        }
        
        if (req.session.user) { session = req.session.user } else session = false
        if (pageCount == 0) { pageCount = 1 }
        if (ajax) {
            res.json({ products: productData, pageCount, page })
        } else {
            res.render('users/shop', { user: session, product: productData, category: categoryData, val: search, selected: category, order: sort, limit: limit, pageCount, page ,id:uid})
        }
    } 
    catch (error) {
        next(error);
    }
}

const loadDetails = async (req, res) => {
  const uid =req.session.user_id ;

  try {
      const id = req.query.id;
      const details = await products.findOne({ _id: id })
      const product = await products.find({ category: details.category });

      res.render("users/details", { user: req.session.user, detail: details, related: product, message: "" , id:uid });
  } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/userProfile"});

  }

};


const againOtp = async (req, res) => {
  try {
      // newOtp = 1234;
      newOtp = sms.sendMessage();
      console.log(newOtp);
      res.send({ newOtp });
  } catch (error) {
      error.message
  }
}

const verifyOtp = async (req, res) => {
    const uid =req.session.user_id
    const categories=await Category.find()
    const product = await products.find({ isAvailable: 1 });
    const banners = await banner.findOne({ is_active: 1 });
  try { 
    
      if (req.body.sendotp == req.body.otp) {
          const userData = await user.save();
          if (userData) {
              res.render('users/index', { user: req.session.user, message: "registered successfully" ,product:product, banner:banners, id:uid,categories:categories})
          }
          else {
              res.render('users/signUp', { user: req.session.user, message: "registration failed!!" })
          }
      } else {

          console.log("otp not match");
          res.render('users/signUp', { user: req.session.user, message: "incorrect otp" })
      }

  } catch (error) {
      console.log(error.message);
  }
}

const loadCheckout = async (req, res) => {
  const uid =req.session.user_id ;

  try {
    const couponData = await coupon.find();
      const userData = req.session.user_id;
      const addresss = await address.find({ userId: userData });
      const userDetails = await User.findById({ _id: userData })
      const completeUser = await userDetails.populate('cart.item.productId')
      if (req.query.coupon) {
        coup = req.query.coupon
    } else {
        coup = 0;
    }
      if(userDetails.is_verified){
        res.render("users/checkout", { user: req.session.user, address: addresss, checkoutdetails: completeUser.cart ,coupon: couponData, discount: req.query.coupon, id:uid});
      }else{
        res.render("users/cart", { user: req.session.user, cartProducts: completeUser.cart, coupon: couponData, reduction: coup, id: uid ,message:"User blocked by ADMIN"});
        // res.redirect("/loadCart")
      }
  } catch (error) {
      console.log(error.message);
  }
}

const applyCoupon = async (req, res) => {
    try {
        const totalPrice = req.body.totalValue;
        console.log("total " + totalPrice );
        console.log(req.body.coupon);
        const coup = req.body.coupon;
        userdata = await User.findById({ _id: req.session.user_id });
        offerdata = await coupon.findOne({ name: req.body.coupon });
        console.log(offerdata);
        if (offerdata) {
            // console.log('p333');
            console.log(offerdata.expiryDate, Date.now());
            const date1 = new Date(offerdata.expiryDate);
            const date2 = new Date(Date.now());
            if (date1.getTime() > date2.getTime()) {
                // console.log('p4444');
                if (offerdata.usedBy.includes(req.session.user_id)) {
                    messag = 'coupon already used'
                    console.log(messag);
                } else {
                    // console.log('eldf');
                    console.log(userdata.cart.totalPrice, offerdata.maximumvalue, offerdata.minimumvalue);
                    if (userdata.cart.totalPrice >= offerdata.minimumvalue) {
                        console.log('COMMING');
                        console.log('offerdata.name');
                        await coupon.updateOne({ name: offerdata.name }, { $push: { usedBy: userdata._id } });
                        console.log('kskdfthg');
                        disc = (offerdata.discount * totalPrice) / 100;
                        if (disc > offerdata.maximumvalue) { disc = offerdata.maximumvalue }
                        console.log(disc);
                        
                        res.send({ offerdata, disc, state: 1 })
                    } else {
                        messag = 'cannot apply'
                        res.send({ messag, state: 0 })
                    }
                }
            } else {
                messag = 'coupon Expired'
                res.send({ messag, state: 0 })
            }
        } else {
            messag = 'coupon not found'
            res.send({ messag, state: 0 })
        }
        res.send({ messag, state: 0 })
    }

    catch (error) {
        console.log(error.message);
    }
}

const loadUserProfile = async (req, res) => {
  const uid =req.session.user_id ;

  try {
      const usid = req.session.user_id;
      const user = await User.findOne({ _id: usid });
      const adid = await address.find({ userId: usid })
      const addressData = await address.find({ userId: usid })
      const orderData = await order.find({ userId: usid }).sort({ createdAt: -1 }).populate("products.item.productId");
      const productDetails = await products.find()
      res.render("users/profile", { user: req.session.user, userAddress: adid, userData: user, address: addressData, order: orderData, productDetails:productDetails , id:uid})
  } catch (error) {
      console.log(error.message);
  }
}

const addNewAddress = async (req, res) => {
  try {
      userSession = req.session
      const nAddress = await new address({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          mobile: req.body.mno,
          userId: userSession.user_id
      })
      const newAddress = await nAddress.save();
      if (newAddress) {
          res.redirect("/userProfile");
      }
  } catch (error) {

  }
}

const deleteAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const Address = await address.deleteOne({ _id: id });
      if (Address) {
          res.redirect("/userProfile");
      }
  } catch (error) {
      console.log(error.message);
  }
}

const editAddress = async (req, res) => {
  const uid =req.session.user_id ;
  try {
      const id = req.query.id;
      const addres = await address.findOne({ _id: id })
      res.render("users/editaddress", { user: req.session.user, address: addres ,id: uid});
  } catch (error) {
      console.log(error.message);
  }
}
const editUpdateAddress = async (req, res) => {
  try {
      const id = req.body.id;
      console.log(req.body);
      console.log(id);
      const upadteAddres = await address.updateOne({ _id: id }, {
          $set: {
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              country: req.body.country,
              address: req.body.address,
              city: req.body.city,
              zip: req.body.zip,
              mobile: req.body.mno
          }
      })
      console.log(upadteAddres);
      res.redirect("/userProfile")
  } catch (error) {
      console.log(error.message);
  }
}

const editUser = async (req, res) => {
  const uid = req.session.user_id
  try {
      const currentUser = req.session.user_id;
      const findUser = await User.findOne({ _id: currentUser });
      res.render("users/editUser", { user: findUser , id:uid});

  } catch (error) {
      console.log(error.message);
  }
}

const editUserUpdate = async (req, res) => {
  try {
      await User.findByIdAndUpdate({ _id: req.body.id }, {
          $set: {
              name: req.body.name,
              email: req.body.email,
              mobile: req.body.number

          }
      })
      res.redirect("/userProfile")
  } catch (error) {
      console.log(error.message);
  }
}


const editCheckoutAddress = async (req, res) => {
  const uid =req.session.user_id ;

  try {
      const id = req.query.id;
      const addressData = await address.findById({ _id: id });
      res.render("users/editCheckoutAddress", { user: req.session.user, address: addressData , id:uid});
  } catch (error) {
      console.log(error.message);
  }
}

const editUpdateCheckoutAddress = async (req, res) => {
  try {
      const id = req.body.id;
      console.log(id);
      const upadteAddres = await address.findByIdAndUpdate({ _id: id }, {
          $set: {
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              country: req.body.country,
              address: req.body.address,
              city: req.body.city,
              zip: req.body.zip,
              mobile: req.body.mno
          }
      })
      console.log(upadteAddres)
      res.redirect("/loadCheckout")
  } catch (error) {
      console.log(error.message);
  }
}

const deleteCheckoutAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const deleteAddress = await address.findByIdAndDelete({ _id: id })
      res.redirect("/loadCheckout")
  } catch (error) {

  }
}

let Norder;
const placeOrder = async (req, res) => {
  const uid = req.session.user_id;
  try {
      if (req.body.address == 0) {
          nAddress = new address({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              country: req.body.country,
              address: req.body.details,
              city: req.body.city,
              state: req.body.state,
              zip: req.body.zip,
              mobile: req.body.mno,
          })
      }
      else {
          console.log("address is: " + req.body.address);
          nAddress = await address.findOne({ _id: req.body.address });
      }
      const userData = await User.findOne({ _id: req.session.user_id })
      Norder = new order({
          userId: req.session.user_id,
          address: nAddress,
          payment: {
              method: req.body.payment,
              amount: req.body.cost,

          },
          offer: req.body.coupon,
          products: userData.cart,
      })
      if (req.body.payment == "COD") {
        Norder.payment.method = "COD";
        Norder.paymentDetails.reciept = Norder._id;
        Norder.paymentDetails.status = 'created';
          await Norder.save();
          const productData = await products.find()
          for (let key of userData.cart.item) {
              for (let prod of productData) {

                  if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                      prod.stock = prod.stock - key.qty
                      await prod.save()
                  }
              }
          }
          await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })
          res.render("users/orderSuccess", { user: req.session.user , id: uid})

      } else if(req.body.payment == "Online"){
        var instance = new RazorPay({
            key_id: process.env.key_id,
            key_secret: process.env.key_secret
        })
        let razorpayOrder = await instance.orders.create({
            amount: req.body.cost * 100,
            currency: 'INR',
            receipt: Norder._id.toString()
        })
        paymentDetails = razorpayOrder;
        const productData = await products.find()
        for (let key of userData.cart.item) {
            for (let prod of productData) {
                if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                    prod.stock = prod.stock - key.qty
                    await prod.save()
                }
            }
        }
        res.render("users/confirmPayment", {
            userId: req.session.user_id,
            order_id: razorpayOrder.id,
            total: req.body.amount,
            session: req.session,
            key_id: process.env.key_id,
            user: userData,
            orders: Norder,
            orderId: Norder._id.toString(),

        });
    }

} catch (error) {
    console.log(error.message);
}
}

const loadOrderSuccess = async (req, res) => {
    const uid = req.session.user_id;
    try {
        Norder.payment.method = "Online";
        Norder.paymentDetails.reciept = paymentDetails.receipt;
        Norder.paymentDetails.status = paymentDetails.status;
        // Norder.paymentDetails.createdAt = paymentDetails.created_at;

        await Norder.save();
        await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } });

        res.render("users/orderSuccess", { user: req.session.user , id:uid});
    } catch (error) {
        console.log(error);
    }
};


const viewOrderDetails = async (req, res) => {
  const uid =req.session.user_id ;

  try {
      const id = req.query.id;
      const users = req.session.user_id
      const orderDetails = await order.findById({ _id: id });
      const addres = await address.findById({ _id: users })
      console.log(addres);
      await orderDetails.populate('products.item.productId')
      res.render("users/viewOrderDetails", { user: req.session.user, orders: orderDetails , id:uid});
  } catch (error) {
    res.render("error",{back:"/userProfile"});
  }
}

const cancelOrder = async (req, res) => {
  try {
      const id = req.query.id;
      const orderDetails = await order.findById({ _id: id });
      let state = "cancelled"
      await order.findByIdAndUpdate({ _id: id }, { $set: { status: "cancelled" , completed : true} })
      if (state == "cancelled") {
          const productData = await products.find()
          const orderData = await order.findById({ _id: id });

          for (let key of orderData.products.item) {
              for (let prod of productData) {
                  console.log(key.productId);
                  if (new String(prod._id).trim() == new String(key.productId).trim()) {
                      prod.stock = prod.stock + key.qty
                      await prod.save()
                  }
              }
          }
      }
      if (state == "cancelled" && orderDetails.payment.method != "COD") {
          userDetails = await User.findOne({ _id: orderDetails.userId });
          const walletData = userDetails.wallet;
          userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })


      }
      res.redirect("/userProfile")
  } catch (error) {
      console.log(error.message);
  }
}

const retunOrder = async (req, res) => {
  try {
      const id = req.query.id;
      const users = req.session.user_id
      const orderDetails = await order.findById({ _id: id });
      const addres = await address.findById({ _id: users })
      const cancel = await order.findByIdAndUpdate({ _id: id }, { $set: { status: "returned" } })
      await orderDetails.populate('products.item.productId')
      let state = "returned";
      if (state == "returned") {
          const productData = await products.find()
          const orderData = await order.findById({ _id: id });
          for (let key of orderData.products.item) {
              for (let prod of productData) {
                  console.log(key.productId);
                  if (new String(prod._id).trim() == new String(key.productId).trim()) {
                      prod.stock = prod.stock + key.qty
                      await prod.save()
                  }
              }
          }
      }
      if (state == "returned" && orderDetails.payment.method != "COD") {
          userDetails = await User.findOne({ _id: orderDetails.userId });
          const walletData = userDetails.wallet;
          userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })
      }
      res.redirect("/userProfile")
  } catch (error) {
      console.log(error.message);
  }
}


   module.exports={
    getIndex,
    getBestSeller,
    getContact,
    getNewArrival,
    getSignUp,
    getSignin,
    postSignup,
    postSignIn,
    twoFactor,
    postLogOut,
    loadShop,
    loadDetails,
    applyCoupon,
    verifyOtp,
    againOtp,
    loadCheckout,
    loadUserProfile,
    addNewAddress,
    deleteAddress,
    editAddress,
    editUpdateAddress,
    editUser,
    editUserUpdate,
    editCheckoutAddress,
    editUpdateCheckoutAddress,
    deleteCheckoutAddress,
    placeOrder,
    viewOrderDetails,
    cancelOrder,
    retunOrder,
    loadOrderSuccess,

   }