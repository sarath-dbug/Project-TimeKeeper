const Category = require('../models/categoryModel');
const categoryOffer = require('../models/categoryOfferModel')
const User = require('../models/usermodel')
const Refer = require('../models/referralModel')



const loadReferralOffer = async (req, res) => {
   try {
      const userData = await User.find({})
      const referralData = await Refer.find({})

      res.render('referralOffer', { userData, refer: referralData })
   } catch (error) {
      console.log(error.message)
   }
}


const editReferral = async (req, res) => {
   try {

      const referId = req.query.referId;

      const referData = await Refer.findOne({ _id: referId })
      const userData = await User.find({})

      const referralData = {
         referrer: req.body.referrer,
         referee: req.body.referee
      }

      if (referData) {
         const couponAdd = await Refer.findByIdAndUpdate(
            { _id: referId },
            { $set: referralData }
         );
      } else {

         const newreferral = new Refer({
            referrer: 100,
            referee: 100
         });

         const createdReferal = await newreferral.save();

      }

      const referraldata = await Refer.find()

      res.render('referralOffer', { refer: referraldata, userData })
   } catch (error) {
      console.log(error);
   }
}


const loadCategoryOffer = async (req, res) => {
   try {
      const err = req.query.err;
      const msg = req.query.msg;

      const categoryOfferData = await categoryOffer.find({});

      const categoryData = await Category.find({});

      if (err) {
         res.render('categoryOffer', { categoryOffer: categoryOfferData, categories: categoryData, message: '', errMessage: msg })
      } else {

         res.render('categoryOffer', { categoryOffer: categoryOfferData, categories: categoryData, message: msg, errMessage: '' })
      }
   } catch (error) {
      console.log(error.message)
   }
}


const addCategoryOffer = async (req, res) => {
   try {
      const categoryId = req.body.categoryName.trim();
      const categoryData = await Category.findById(categoryId)
      const categoryName = categoryData.name;

      const offerPrice = req.body.offerPrice

      const newcategoryOffer = new categoryOffer({
         name: categoryName,
         price: offerPrice
      });
      const savedBrand = await newcategoryOffer.save();
      res.redirect(`/admin/categoryOffer?err=${""}&msg=ategory offer created successfully`);

   } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
   }
}


const editcategoryOffer = async (req, res) => {
   const categoryId = req.body.editBrandId.trim();
   const newName = req.body.editBrandName.trim();
   const newPrice = req.body.offerPrice;
   console.log(newPrice + '**************************');
   try {

      const exitingBrand = await categoryOffer.findOne({ name: newName });

      if (exitingBrand && exitingBrand.price === newPrice) {
         res.redirect(`/admin/categoryOffer?err=${true}&msg=Category name already exists`);
      } else {
         const updatedBrand = await categoryOffer.findByIdAndUpdate(categoryId, { name: newName, price: newPrice }, { new: true });
         res.redirect(`/admin/categoryOffer?err=${""}msg=Category updated successfully`);
      }
   } catch (error) {
      res.redirect(`/admin/categoryOffer?err=${true}&msg=Failed to update Category`);
   }
}

module.exports = {
   loadReferralOffer,
   editReferral,
   loadCategoryOffer,
   addCategoryOffer,
   editcategoryOffer
}