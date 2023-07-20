const product = require('../models/productModel');
const User = require("../models/userModel");
const category = require("../models/category");
const Staff = require("../models/staffsModel")


const loadProduct = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });

    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const productData = await product.find({ name: { $regex: search + ".*" } })
    if(UserData){
      res.render("admin/products", { products: productData ,admin: UserData});
    }else if(StaffData){
      res.render("admin/products", { products: productData ,admin: StaffData});
    }
  } catch (error) {
    console.log(error.message);
  }
};


const showProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await product.findOne({ _id: id });
    if (productData.isAvailable) {
      await product.findByIdAndUpdate({ _id: id }, { $set: { isAvailable: 0 } })
    } else {
      await product.findByIdAndUpdate({ _id: id }, { $set: { isAvailable: 1 } })
    }
    res.redirect("/admin/product")
  }
  catch (error) {
    console.log(error.message);
  }
};


const showEditProduct = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    const id = req.query.id;
    const categotyData = await category.find({})
    const productData = await product.findById({ _id: id });
    if (productData) {
      if(UserData){
        res.render("admin/editProducts", { products: productData, category: categotyData, message: "", admin: UserData });

      }else if(StaffData){
        res.render("admin/editProducts", { products: productData, category: categotyData, message: "" , admin: StaffData});

      }
    } else {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateImage = async (req, res) => {
  try {
    let { pId, img } = req.body
    console.log(pId, img);
    await product.updateOne({ _id: pId }, { $pull: { image: img } })
    const productData = product.findOne({ _id: pId })
    console.log(productData);
    res.send({ newImage: productData.image });
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


const editProduct = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    console.log(req.files);
    if (req.files.length != 0) {
      const productDetails = await product.findOne({ _id: req.query.id })
      const oldImg = productDetails.image
      const newImg = req.files.map((x) => x.filename)
      const images = oldImg.concat(newImg)
      console.log(images);
      productt = await product.updateOne({ _id: req.query.id }, {
        $set: {
          name: req.body.pName,
          stock: req.body.pStock,
          description: req.body.pDescription,
          price: req.body.pPrice,
          rating: req.body.pRating,
          category: req.body.pCategory,
          image: images
        }
      })
    } else {
      productt = await product.updateOne({ _id: req.query.id }, {
        $set: {
          name: req.body.pName,
          price: req.body.pPrice,
          description: req.body.pDescription,
          stock: req.body.pStock,
          rating: req.body.pRating,
          category: req.body.pCategory,
        }
      })
    } console.log(productt);
    const productData = await product.find()
    if (productData) {
      if(UserData){
        res.render("admin/products", {message: "registration successfull.",products: productData,admin: UserData})
      }else if(StaffData){
        res.render("admin/products", {message: "registration successfull.",products: productData,admin: StaffData})
      }
    } else {
      if(UserData){
        res.render("admin/products", { message: "registration failed", products: productData , admin: UserData})

      }else if(StaffData){
        res.render("admin/products", { message: "registration failed", products: productData , admin: StaffData})
        
      }
    }
  } catch (error) {
    console.log(error.message)
    res.render("error",{back:"/admin/order"});
  }
}

const loadAddProducts = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id });
    const StaffData = await Staff.findById({ _id: req.session.admin_id });
    
    const categoryData = await category.find({});
    const userData = await User.findById({ _id: req.session.admin_id });
    if(UserData){
      res.render("admin/addProducts", { admin: userData, category: categoryData, message: "" });
    }else if(StaffData){
      res.render("admin/addProducts", { admin: StaffData, category: categoryData, message: "" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


const addAddProducts = async (req, res) => {
  
  const UserData = await User.findById({ _id: req.session.admin_id });
  const StaffData = await Staff.findById({ _id: req.session.admin_id });
  
  if (req.files.length != 0) {
    try {
      const productdetails = new product({
        name: req.body.pName,
        price: req.body.pPrice,
        stock: req.body.pStock,
        rating: req.body.pRating,
        category: req.body.pCategory,
        description: req.body.pDescription,
        image:req.files.map((x) => x.filename),
      });
      const productData = await productdetails.save();
      if (productData) {
        res.redirect("/admin/product");
      }
    } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/admin/order"});
    }
  } else {
    const categoryData = await category.find();
    const userData = await User.find();
    if(UserData){
      res.render("admin/addProducts", { admin: UserData, category: categoryData, message: "file should be image" })

    }else if(StaffData){
    res.render("admin/addProducts", { admin: StaffData, category: categoryData, message: "file should be image" })
      
    }
  }

};
module.exports = {
  loadProduct,
  loadAddProducts,
  showEditProduct,
  updateImage,
  editProduct,
  addAddProducts,
  showProduct,
}