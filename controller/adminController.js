const User = require("../models/userModel");
const category = require("../models/category");
const Product = require("../models/productModel");
const orders = require("../models/orderModel");
const Staff = require("../models/staffsModel")

const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("admin/adminLogin", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});

  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    const staffData = await Staff.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("admin/adminLogin", { message: "email and password incorrect" });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("admin/adminLogin", { message: " password is incorrect", user: req.session.admin_id });
      }
    } else if (staffData) {
      if(staffData.is_verified){
        const passwordMatch = await bcrypt.compare(password, staffData.password);

      if (passwordMatch) {
        if (staffData.is_admin === 0) {
          res.render("admin/adminLogin", { message: "email and password incorrect" });
        } else {
          req.session.admin_id = staffData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("admin/adminLogin", { message: " password is incorrect", user: req.session.admin_id });
      }
    }else{
      res.render("admin/adminLogin", { message: "staff is blocked", user: req.session.admin_id });
    } } else {
      res.render("admin/adminLogin", { message: "email is incorrect", user: req.session.admin_id });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});

  }
};


const loadDashboard = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    const products = await Product.find({stock:{$lte:40} })
  
    let pds = [], qty = []
    products.map(x => {
      pds = [...pds, x.name]
      qty = [...qty, x.stock]
    })
    const arr = [];
    const order = await orders.find().populate('products.item.productId');
    for (let orders of order) {
      for (let product of orders.products.item) {
        const index = arr.findIndex(obj => obj.product == product.productId.name);
        if (index !== -1) {
          arr[index].qty += product.qty;
        } else {
          arr.push({ product: product.productId.name, qty: product.qty });
        }
      }
    }
    const key1 = [];
    const key2 = [];
    arr.forEach(obj => {
      key1.push(obj.product);
      key2.push(obj.qty);
    });
    const sales = key2.reduce((value, number) => {
      return value + number;
    }, 0)
    let totalRevenue =0
    for(let orders of order){
       totalRevenue += orders.products.totalPrice;
     }


     const key3=[];
     for(let i=1; i<=12; i++){
      let cancels = 0;
      for(let orders of order){
        if(i===(orders.createdAt.getMonth()+1)){
          if(orders.status == "cancelled"){
            cancels++;
          }
        }
      }
      key3.push(cancels);
   
     }

    
    const userData = await User.findById({ _id: req.session.admin_id });


    if(UserData){
      // console.log("adminData: "+UserData);
    res.render("admin/home", { admin: userData, key1, key2,key3, pds, qty, sales,totalRevenue});
    }else if(StaffData){
      // console.log("adminData: "+StaffData);
    res.render("admin/home", { admin: StaffData, key1, key2,key3, pds, qty, sales,totalRevenue});
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};



const loadUser = async (req, res) => {
  try {
    
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({ name: { $regex: search + ".*" }, is_admin: 0});
    if(UserData){
      res.render("admin/user", { users: userData ,admin: UserData});
    }else if(StaffData){ 
      res.render("admin/user", { users: userData ,admin: StaffData  });
    }
    
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const loadCategory = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await category.find({ name: { $regex: search + ".*" } })
    if(UserData){
      res.render("admin/categories", { category: userData ,admin: UserData});
    }else if(StaffData){
      res.render("admin/categories", { category: userData ,admin: StaffData});
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


const addCategories = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    const userData = await User.findById({ _id: req.session.admin_id });
    if(userData){
      res.render("admin/addCategories", { admin: userData, message: "" });
    }else if(StaffData){
      res.render("admin/addCategories", { admin: StaffData, message: "" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


const addCategoriesredir = async (req, res) => {
  const UserData = await User.findById({ _id: req.session.admin_id });
  const StaffData = await Staff.findById({ _id: req.session.admin_id });
  let cat = req.body.addCategory
  if(cat.length > 15){
    if(UserData){
      res.render("admin/addCategories", { message: "category name should not exceed 15 characters" , admin: UserData});
    }else if(StaffData){
      res.render("admin/addCategories", { message: "category name should not exceed 15 characters" , admin: StaffData});
    }
    return
  }
  const findCat = await category.findOne({ name: req.body.addCategory });
  if (findCat) {
    if(UserData){
      res.render("admin/addCategories", { message: "already exists!" , admin: UserData});
    }else if(StaffData){
      res.render("admin/addCategories", { message: "already exists!" , admin: StaffData});
    }
  } else {
    try {
      const addCategory = new category({ name: req.body.addCategory })
      addCategory.save()

      res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/admin/order"});
    }
  }

};


const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await category.findOne({ _id: id });
    if (categoryData.is_available) {
      await category.findByIdAndUpdate({ _id: id }, { $set: { is_available: 0 } }); console.log("hidden");
    }
    else { await category.findByIdAndUpdate({ _id: id }, { $set: { is_available: 1 } }); console.log("unhidden"); }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    res.render("error",{back:"/admin/order"});
  }
};



const editCategory = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    e_id = req.query.id;
    const catagoryDetail = await category.findOne({ _id: e_id })
    if(UserData){
      res.render("admin/editCategories", { category: catagoryDetail, message: "" , admin:UserData});
    }else if(StaffData){
      res.render("admin/editCategories", { category: catagoryDetail, message: "" , admin:StaffData});
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const editUpdateCategory = async (req, res) => {
  const UserData = await User.findById({ _id: req.session.admin_id });
  const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
  const find = await category.findOne({ name: req.body.addCategory })
  if (find) {
    const cat = await category.find();
    if(UserData){
      res.render("admin/editCategories", { message: "already Exists!!", category: cat , admin: UserData})
    }else if(StaffData){
      res.render("admin/editCategories", { message: "already Exists!!", category: cat , admin: StaffData})
    }
  } else {

    try {
      const categotyData = await category.updateOne({ _id: e_id }, { $set: { name: req.body.addCategory } });
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/admin/order"});
    }
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin_id = null;
    req.session.admin = null
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

// const adminDashboard = async (req, res) => {
//   const UserData = await User.findById({ _id: req.session.admin_id });
//   const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
//   try {
//     var search = "";
//     if (req.query.search) {
//       search = req.query.search;

//     }
//     const userData = await User.find({
//       is_admin: 0,
//       $or: [
//         { name: { $regex: ".*" + search + ".*" } },
//         { email: { $regex: ".*" + search + ".*" } },
//         { mobile: { $regex: ".*" + search + ".*" } },
//       ],
//     });
//     res.render("admin/dashboard", { users: userData });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const BlockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    if (userData.is_verified) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 0 } }); console.log("blocked");
    }
    else { await User.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 1 } }); console.log("unblocked"); }
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error);
    res.render("error",{back:"/admin/order"});
  }
}

const loadOrder = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    

    const allorders = await orders.find({}).populate("userId").sort({ $natural: -1 });
    const userData = await User.findById({ _id: req.session.admin_id });
    if(UserData){
      res.render("admin/orders", { admin: userData, orders: allorders, orderDetail: allorders });
    }else if(StaffData){
      res.render("admin/orders", { admin: StaffData, orders: allorders, orderDetail: allorders });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const sortOrder = async (req, res) => {
  let { start, end } = req.body
  console.log(start, end);
  
  const allOrders = await orders.find({
    createdAt: { $gte: start, $lte: end }
  }).populate("userId");
  res.send({ orderDetail: allOrders });
}


const viewOrderDetails = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    const id = req.query.id;
    const order = await orders.findById({ _id: id });
    const details = await order.populate('products.item.productId')
    if(UserData){
      res.render("admin/viewOrderDetails", { orders: details , admin: UserData });
    }else if(StaffData){
       res.render("admin/viewOrderDetails", { orders: details , admin: StaffData});
    }  
    
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}



const updateStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;
    const orderDetails = await orders.findByIdAndUpdate({ _id: orderId }, { $set: { status: status } })
    if ((status == "cancelled") && orderDetails.payment.method !== "COD") {
      const orderData = await orders.findByIdAndUpdate({ _id: orderId },{ $set: { completed: true }})
      userDetails = await User.findOne({ _id: orderDetails.userId });
      const walletData = userDetails.wallet;
      userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })
    }
    if (status == "cancelled") {

      const productData = await Product.find()
      const orderData = await orders.findByIdAndUpdate({ _id: orderId },{ $set: { completed: true }})
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
    if(status == 'returned'){
      const orderData = await orders.findByIdAndUpdate({ _id: orderId },{ $set: { completed: true }})
    }
    if(status == 'Delivered'){
      const orderData = await orders.findByIdAndUpdate({ _id: orderId },{ $set: { completed: true }})
    }
    res.redirect("/admin/order")
  } catch (error) {

    res.render("error",{back:"/admin/order"});
  }
}



module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadCategory,
  loadUser,
  loadOrder,
  logout,
  // adminDashboard,
  addCategoriesredir,
  editCategory,
  addCategories,
  BlockUser,
  editUpdateCategory,
  deleteCategory,
  viewOrderDetails,
  updateStatus,
  sortOrder

};




