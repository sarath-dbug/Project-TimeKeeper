
const Coupon = require('../models/couponModel')
const couponHelpers = require('../helpers/couponHelper')


//coupon
const loadAddCoupon = async (req, res) => {
   try {
      res.render("addCoupon")
   } catch (error) {
      console.log(error);
   }
}

const addCoupon = async (req, res) => {
   try {
      const newCouponData = req.body;

      const couponExist = await couponHelpers.verifyCouponExist(newCouponData);

      if (couponExist.status) {
         const couponAddingStatus = await couponHelpers.addNewCoupon(newCouponData);

         res.redirect('/admin/addCoupon');

      } else if (couponExist.duplicateCoupon) {

         req.session.couponExistError = "Coupon code already exist, try some other code"

         res.redirect('/admin/addCoupon');

      }
   } catch (error) {
      console.log(error);
   }
}

const couponList = async (req, res) => {
   try {
      const couponData = await Coupon.find();
      res.render('couponList', { couponData })
   } catch (error) {
      console.log(error);
   }
}

const editCoupon = async (req, res) => {
   try {
      const couponId = req.query.couponId
      const couponData = await Coupon.findById(couponId)
      res.render("editCoupon", { coupon: couponData })
   } catch (error) {
      console.log(error);
   }
}

const editCouponAdd = async (req, res) => {
   try {
      const couponId = req.params.couponId
      const coupon = await Coupon.findById({ _id: couponId }).lean();
      const couponData = await Coupon.find();

      const usageCount = 0;
      const createdOn = new Date();

      let updatedData = {
         couponCode: req.body.couponCode.toLowerCase(),
         couponDescription: req.body.couponDescription,
         discountPercentage: req.body.discountPercentage,
         maxDiscountAmount: req.body.maxDiscountAmount,
         minOrderValue: req.body.minOrderValue,
         validFor: req.body.validFor,
         activeCoupon: req.body.activeCoupon === "true" ? true : false,
         usageCount: usageCount,
         createdOn: createdOn
      }

      const couponAdd = await Coupon.findByIdAndUpdate(
         { _id: couponId },
         { $set: updatedData }
      );
      res.render('couponList', { couponData })

   } catch (error) {
      console.log(error);
   }
}

const toggleBlockStatusCoupons = async (req, res) => {
   try {

      const couponId = req.params.couponId;
      const blockStatus = req.body.blocked;
      console.log(couponId, blockStatus + "********************");
      const couponData = await Coupon.findById(couponId);
      console.log(couponData);

      if (!couponData) {
         return res.status(404).json({ message: 'coupon not found' });
      } else {
         couponData.activeCoupon = blockStatus;
         await couponData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }

   } catch (error) {
      console.log(error);
   }
}

module.exports = {
   loadAddCoupon,
   addCoupon,
   couponList,
   editCoupon,
   editCouponAdd,
   toggleBlockStatusCoupons
}