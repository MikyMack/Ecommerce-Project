const banner = require("../models/bannerModel");
const User = require("../models/userModel");




const loadBanner = async (req, res) => {
  try {
    const banners = await banner.find()
    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("admin/banner", { admin: userData, banner: banners });
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const loadAddBanner = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("admin/addBanner", { admin: userData, message: "" });
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
}



const addBanner = async (req, res) => {
  if (req.files.length != 0) {
    try {
      const bannerDetails = new banner({
        name: req.body.bName,
        image: req.files.map((x) => x.filename),
        description: req.body.bDescription,
      });
      const bannerData = await bannerDetails.save();
      if (bannerData) {
        res.redirect("/admin/banner");
      }
    } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/admin/order"});
    }
  } else {
    const bannerData = await banner.find();
    const userData = await User.find();
    res.render("admin/addBanner", { admin: userData, banners: bannerData, message: "file should be image" })
  }

};

const hideBanner = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const bannerData = await banner.findOne({ _id: id });
    if (bannerData.is_active) {
      await banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 0 } }); console.log("hidden");
    }
    else { await banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 1 } }); console.log("unhidden"); }
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


const editBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const bannerData = await banner.findById({ _id: id });
    if (bannerData) {
      res.render("admin/editBanner", { banner: bannerData, message: "" });
    } else {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};

const editModifyBanner = async (req, res) => {
  if (req.files.length != 0) {
    try {
      const bannerData = await banner.findByIdAndUpdate({ _id: req.body.id }, {
        $set: {
          name: req.body.bName,
          image: req.files.map((x) => x.filename),
          description: req.body.bDescription,
        },
      }
      );
      res.redirect("/admin/banner")
    } catch (error) {
      console.log(error.message);
      res.render("error",{back:"/admin/order"});
    }
  } else {
    const userData = await User.find();
    const bannerData = await banner.find()
    res.render("admin/editBanner", { admin: userData, banner: bannerData, message: "file should be image!!" })
  }
};


const updateImag = async (req, res) => {
  try {
    let { pId, img } = req.body
    console.log(pId, img);
    await banner.updateOne({ _id: pId }, { $pull: { image: img } })
    const productData = banner.findOne({ _id: pId })
    console.log(productData);
    res.send({ newImage: productData.image });
  } catch (error) {
    console.log(error.message);
    res.render("error",{back:"/admin/order"});
  }
};


module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
  hideBanner,
  editBanner,
  editModifyBanner,
  updateImag
}