
const Category = require('../models/categoryModel');

const categories = async (req, res) => {
   try {
      const err = req.query.err;
      const msg = req.query.msg;
      console.log(typeof err);
      const categorieData = await Category.find({});
      if (err) {
         res.render('categories', { categories: categorieData, message: '', errMessage: msg })
      } else {

         res.render('categories', { categories: categorieData, message: msg, errMessage: '' })
      }

   } catch (error) {
      console.log(error.message)
   }
}


const addCategories = async (req, res) => {
   try {
      const categoryName = req.body.categoryName.trim();
      const newCategory = new Category({
         name: categoryName,
      });

      const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

      if (existingCategory) {
         res.redirect(`/admin/categories?err=${true}&msg=category name already exists`);
      } else {

         const savedCategory = await newCategory.save();

         res.redirect(`/admin/categories?err=${""}&msg=category created successfully`);

      }
   } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
   }
}


const editCategory = async (req, res) => {
   const categoryId = req.body.editCategoryId.trim();
   const newName = req.body.editCategoryName.trim();
   try {

      const existingCategory = await Category.findOne({ name: newName });

      if (existingCategory) {
         res.redirect(`/admin/categories?err=${true}&msg=Category name already exists`);
      } else {
         const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name: newName }, { new: true });
         res.redirect(`/admin/categories?err=${""}msg=Category updated successfully`);
      }
   } catch (error) {
      res.redirect(`/admin/categories?err=${true}&msg=Failed to update category`);
   }
}


const toggleBlockStatus = async (req, res) => {
   try {
      const categoryId = req.params.categoryId;
      const blockStatus = req.body.blocked;
      const categoryData = await Category.findById(categoryId);

      if (!categoryData) {
         return res.status(404).json({ message: 'Category not found' });
      } else {
         categoryData.blocked = blockStatus;
         await categoryData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }
   } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}

module.exports = {
   categories,
   addCategories,
   editCategory,
   toggleBlockStatus
}