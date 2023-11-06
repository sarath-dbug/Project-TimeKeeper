
const Banner = require('../models/bannerModel')


//Banner
const loadAddBanner = async (req, res) => {
    try {
       const banner = await Banner.find();
 
       res.render('addBanner', { Banner: banner })
    } catch (error) {
       console.log(error);
    }
 }
 
 
 const addBanner = async (req, res) => {
    try {
       console.log("iAM HERE******************");
       const name = req.body.name;
       const discription = req.body.discription;
       const image = req.file.filename;
 
       const banner = new Banner({
          name: name,
          discription: discription,
          image: image,
       });
 
       const BannerData = await banner.save();
       res.redirect("/admin/bannerList");
    } catch (error) {
       console.log(error);
    }
 }
 
 const bannerList = async (req, res) => {
    try {
       const banner = await Banner.find();
 
       res.render("bannerList", { Banners: banner });
    } catch (error) {
       console.log(error.message);
    }
 };
 
 const unlistBanner = async (req, res) => {
    try {
       id = req.query.id;
 
       await Banner.findByIdAndUpdate({ _id: id }, { $set: { unlist: true } });
 
       res.redirect("/admin/bannerList");
    } catch (error) {
       console.log(error.message);
    }
 };
 
 const listBanner = async (req, res) => {
    try {
       id = req.query.id;
 
       await Banner.findByIdAndUpdate({ _id: id }, { $set: { unlist: false } });
 
       res.redirect("/admin/bannerList");
    } catch (error) {
       console.log(error.message);
    }
 };
 
 const loadEditBanner = async (req, res) => {
    try {
       const bannerId = req.query.bannerId;
       const bannerData = await Banner.findById(bannerId)
       res.render('editBanner', { Banner: bannerData })
    } catch (error) {
       console.log(error.message);
    }
 };
 
 
 const editBanner = async (req, res) => {
    try {
       const bannerId = req.params.bannerId
       const banner = await Banner.findById({ _id: bannerId })
 
       let updatedData = {
          name: req.body.name,
          discription: req.body.discription,
       }
 
       if (req.file) {
          updatedData.image = req.file.filename;
       } else {
          updatedData.image = banner.image;
       }
 
 
       const banner1 = await Banner.findByIdAndUpdate(
          { _id: bannerId },
          { $set: updatedData }
       );
 
       const bannerData = await Banner.find();
       res.render("bannerList", { Banners: bannerData });
    } catch (error) {
       console.log(error.message);
    }
 };


 module.exports = {
    loadAddBanner,
   addBanner,
   bannerList,
   unlistBanner,
   listBanner,
   loadEditBanner,
   editBanner
 }