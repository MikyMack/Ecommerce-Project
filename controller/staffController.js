const Staff = require("../models/staffsModel");
const bcrypt = require('bcrypt');


const loadStaffs = async (req, res) => {
    try {
      var search = "";
      if (req.query.search) {
        search = req.query.search;
      }
      const staffData = await Staff.find({ name: { $regex: search + ".*" }, is_admin: 1 });
      res.render("admin/staff", { users: staffData });
    } catch (error) {
      console.log(error.message);
    }
  };

  let staff;
  const addStaff = async (req,res)=>{
    console.log("adding staff...");
    
    var search = "";
      if (req.query.search) {
        search = req.query.search;
      }
      const staffData = await Staff.find({ name: { $regex: search + ".*" }, is_admin: 1 });

    const verify = await Staff.findOne({ $or: [{ email: req.body.email }] });
    if (verify) {
        console.log(verify);
        res.render('admin/staff', {users: staffData , message: "Staff already exists!" })
    } else {
        const spassword = await bcrypt.hash(req.body.password, 10);
        staff = new Staff({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            is_admin: 1,
            staff_No: req.body.staff_no,
        });
        const stafData = await staff.save();
        console.log(stafData);
          if (stafData) {
            
            res.redirect('/admin/staff')
          }
          else {
            res.render('admin/staff', {users: staffData , mesage: "registration failed!!" })
          }
    }
  }

  const BlockStaff = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await Staff.findOne({ _id: id });
      if (userData.is_verified) {
        await Staff.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 0 } }); console.log("blocked");
      }
      else { await Staff.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 1 } }); console.log("unblocked"); }
      res.redirect("/admin/staff");
    } catch (error) {
      console.log(error);
    }
  }

  module.exports ={
    loadStaffs,
    addStaff,
    BlockStaff,
  }