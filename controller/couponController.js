const User = require("../models/userModel");
const coupon = require("../models/couponModel");
const Staff = require("../models/staffsModel")




const loadCoupon = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    const coupons = await coupon.find();
    if(UserData){
      res.render("admin/coupon", { coupon: coupons , admin: UserData});
    }else if(StaffData){
      res.render("admin/coupon", { coupon: coupons , admin: StaffData});
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}

const addCoupon = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    if(UserData){
      res.render("admin/addCoupon", { message: "" , admin: UserData});
    }else if(StaffData){
      res.render("admin/addCoupon", { message: "" , admin: StaffData});
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}

const addNewCoupon = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    const verifyCoup = await coupon.findOne({ name: req.body.coupName });
    if (verifyCoup) {
      if(UserData){
        res.render("admin/addCoupon", { message: "already exists" , admin: UserData})
      }else if(StaffData){
        res.render("admin/addCoupon", { message: "already exists" , admin: StaffData})
      }
    } else {
      const addCoupon = new coupon({ name: req.body.coupName, discount: req.body.coupDis, minimumvalue: req.body.coupMin, maximumvalue: req.body.coupMax, expiryDate: req.body.coupDate });
      addCoupon.save();
      res.redirect("/admin/loadCoupon")
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const coupData = await coupon.deleteOne({ _id: id })
    res.redirect("/admin/loadCoupon")
    console.log(coupData);
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}

const availCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const allCoupon = await coupon.findOne({ _id: id });
    if (allCoupon.isAvailable) {
      await coupon.updateOne({ _id: id }, { $set: { isAvailable: 0 } })
    } else {
      await coupon.updateOne({ _id: id }, { $set: { isAvailable: 1 } })

    }
    res.redirect("/admin/loadCoupon");
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const editCoupon = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    const id = req.query.id;
    console.log(id);
    const couponDetail = await coupon.findOne({ _id: id });
    if(UserData){
      res.render("admin/editCoupon", { coupon: couponDetail, message: "" , admin: UserData})
    }else if(StaffData)[
      res.render("admin/editCoupon", { coupon: couponDetail, message: "" , admin: StaffData})
    ]
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const editUpdateCoupon = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    const coupName = req.body.coupName;
    const coupDisc = req.body.coupDis;
    const coupMin = req.body.coupMin;
    const coupMax = req.body.coupMax;
    id = req.body.id;
    const search = await coupon.findOne({ name: req.body.coupName });
    if (search) {
      console.log("same same same");
      const coupaData = await coupon.findOne({ _id: id })
      if(UserData){
        res.render("admin/editCoupon", { message: "already exists", coupon: coupaData , admin: UserData});

      }else if(StaffData){
        res.render("admin/editCoupon", { message: "already exists", coupon: coupaData , admin: StaffData});
      }
    } else {
      const coupData = await coupon.updateOne({ name: coupName }, { $set: { name: coupName, discount: coupDisc, minimumvalue: coupMin, maximumvalue: coupMax } });
      if (coupData) {
        res.redirect("/admin/loadCoupon");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}

module.exports = {
  loadCoupon,
  addCoupon,
  addNewCoupon,
  availCoupon,
  editCoupon,
  editUpdateCoupon,
  deleteCoupon,
}