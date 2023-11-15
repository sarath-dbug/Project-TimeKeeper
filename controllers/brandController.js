const Brand = require('../models/brandModel')


const brands = async (req, res) => {
   try {
      const err = req.query.err;
      const msg = req.query.msg;
      console.log(typeof err);
      const brandData = await Brand.find({});
      if (err) {
         res.render('brands', { brands: brandData, message: '', errMessage: msg })
      } else {

         res.render('brands', { brands: brandData, message: msg, errMessage: '' })
      }

   } catch (error) {
      console.log(error.message)
   }
}


const addBrands = async (req, res) => {
   try {
      const brandName = req.body.brandName.trim();
      const newBrand = new Brand({
         name: brandName,
      });

      const exitingBrand = await Brand.findOne({ name: brandName });

      if (exitingBrand) {
         res.redirect(`/admin/brands?err=${true}&msg=brand name already exists`);
      } else {

         const savedBrand = await newBrand.save();

         res.redirect(`/admin/brands?err=${""}&msg=brand created successfully`);

      }
   } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
   }
}


const editBrand = async (req, res) => {
   const brandId = req.body.editBrandId.trim();
   const newName = req.body.editBrandName.trim();
   try {

      const exitingBrand = await Brand.findOne({ name: newName });

      if (exitingBrand) {
         res.redirect(`/admin/brands?err=${true}&msg=Brand name already exists`);
      } else {
         const updatedBrand = await Brand.findByIdAndUpdate(brandId, { name: newName }, { new: true });
         res.redirect(`/admin/brands?err=${""}msg=Brand updated successfully`);
      }
   } catch (error) {
      res.redirect(`/admin/brands?err=${true}&msg=Failed to update brand`);
   }
}


const toggleBlockStatusbrand = async (req, res) => {
   try {
      const brandId = req.params.brandId;
      const blockStatus = req.body.blocked;
      const brandData = await Brand.findById(brandId);

      if (!brandData) {
         return res.status(404).json({ message: 'Brand not found' });
      } else {
         brandData.blocked = blockStatus;
         await brandData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }
   } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}

module.exports = {
   brands,
   addBrands,
   editBrand,
   toggleBlockStatusbrand
}