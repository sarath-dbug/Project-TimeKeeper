const admin = require('../models/adminModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const User = require('../models/usermodel')

const loadLogin = async (req, res) => {
   try {
      const err = req.query.err;
      const msg = req.query.msg;
      console.log(typeof err);
      if (err) {
         res.render('login', { message: '', errMessage: msg })
      } else {
         res.render('login', { message: msg, errMessage: '' })
      }
   } catch (error) {
      console.log(error.message);
   }
}

const verifyUser = async (req, res) => {
   try {
      const email = req.body.email;
      const password = req.body.password;
      const adminData = await admin.findOne({ email: email });
      console.log(adminData);

      if (adminData) {
         if (adminData.password === password) {
            req.session.admin_id = adminData._id;
            res.render('home');
         } else {
            res.redirect(`/admin/?err=${true}&msg=Invalid Password`);
         }
      } else {
         res.redirect(`/admin/?err=${true}&msg=Invalid Email`);
      }
   } catch (error) {
      console.log(error.message);
   }
}

const loadhome = async (req, res) => {
   try {
      if (req.session.admin_id) {
         res.render('home');
      } else {
         res.redirect('/admin')
      }
   } catch (error) {
      console.log(error.message)
   }
}

const logout = async (req, res) => {
   try {
      req.session.admin_id = null;
      res.redirect('/admin')
   } catch (error) {
      console.log(error.message)
   }
}

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

      const existingCategory = await Category.findOne({ name: categoryName });

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
         console.log("Reached editCategory and finished updating the category name");

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


const product = async (req, res) => {
   try {
      
      const err = req.query.err
      const msg =req.query.msg

      const categorieData = await Category.find({});
      if (err) {
         res.render('addProduct', { categories: categorieData, message: '', errMessage:msg})
      } else {
         res.render('addProduct', { categories: categorieData, message:msg, errMessage: '' })
      }
   } catch (error) {
      console.log(error.message)
   }
}


const addProduct = async (req, res) => {
   try {
      const { product_name, description, category, stock, regular_price, sales_price, color, brand } = req.body
      console.log("loading" + category);
      var arrImg = []
      for (let i = 0; i < req.files.length; i++) {
         arrImg[i] = req.files[i].filename
      }
      const findCategory = await Category.findOne({ _id: category });
      console.log(findCategory.name);

      var product = new Product({
         product_name: product_name,
         description: description,
         brand: brand,
         color: color,
         category: findCategory.name,
         regular_price: regular_price,
         sales_price: sales_price,
         stock: stock,
         image: arrImg
      })

      const product_data = await product.save()
      res.redirect(`/admin/addProduct?err=${""}&msg=Product and image uploaded successfully`);

   } catch (error) {
      console.log(error);
      res.redirect(`/admin/addProduct?err=${true}&msg=Internal server error`);
   }
}


const productList = async (req, res) => {
   try {
      const categorieData = await Category.find({})
      const productData = await Product.find({})
      res.render('productList', { categories: categorieData, products: productData })
   } catch (error) {
      console.log(error);

   }
}


const toggleBlockStatusProducts = async (req, res) => {
   try {
      const productId = req.params.productId;
      const blockStatus = req.body.blocked;
      const productData = await Product.findById(productId);

      if (!productData) {
         return res.status(404).json({ message: 'Category not found' });
      } else {
         productData.blocked = blockStatus;
         await productData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }
   } catch (error) {
      console.log(error);
   }
}


const editProduct = async (req,res)=>{
   try {

      const err = req.query.err;
      const msg = req.query.msg;
      const productId = req.query.productId;
      const productData = await Product.findById(productId).populate('category');
      const categorieData = await Category.find({})
      if(err){
         res.render('editProduct',{message:"",errMessage:err,categories: categorieData, products: productData})
      }else{
         res.render('editProduct',{message:msg,errMessage:"",categories: categorieData, products: productData})
      } 
   } catch (error) {
      console.log(error);
      
   }
}

const editProductAdd = async (req,res)=>{
   try {
      const productId = req.params.productId;

      const product = await Product.findById({_id:productId}).lean();
      const categorieData = await Category.find({})
      const productData = await Product.find({})

      let updatedData = {
         product_name: req.body.product_name,
         regular_price: req.body.regular_price,
         sales_price: req.body.sales_price,
        description: req.body.description,
        brand: req.body.brand,
        color: req.body.color,
        category: req.body.category,
        stock: req.body.stock,
        image: product.image 
      };

         updatedData.image = req.files.map((image) => image.filename);
         
      const product1 = await Product.findByIdAndUpdate(
        { _id: productId},
        { $set: updatedData }
      );
      res.render('productList',{categories:categorieData,products:productData})
    } catch (error) {
      console.log(error.message);
    }
}


const userList = async (req,res)=>{
   try {
      const userData = await User.find({})
      res.render('userList',{user:userData})
   } catch (error) {
      console.log();
   }
}

const toggleBlockStatusUser = async (req, res) => {
   try {
      const userId = req.params.userId;
      const blockStatus = req.body.blocked;
      const userData = await User.findById(userId);
      if (!userData) {
         return res.status(404).json({ message: 'Category not found' });
      } else {
         userData.is_blocked = blockStatus;
         await userData.save();
         return res.status(200).json({ message: 'Block status updated successfully' });
      }
   } catch (error) {
      console.log(error);
   }
}

const searchUser = async (req, res) => {
   try {
      const searchInput = (req.body.name);
      const usersData = await User.find({
         $or: [
           { first_name: { $regex: searchInput, $options: 'i' } },
           { last_name: { $regex: searchInput, $options: 'i' } },
           { display_name: { $regex: searchInput, $options: 'i' } },
           { email: { $regex: searchInput, $options: 'i' } }
         ]
       }).sort({ name: 1 });
             res.render('userList', { user: usersData });
   } catch (error) {
      console.log(error.message)
   }
}



module.exports = {
   loadLogin,
   verifyUser,
   logout,
   categories,
   addCategories,
   editCategory,
   toggleBlockStatus,
   loadhome,
   product,
   addProduct,
   productList,
   toggleBlockStatusProducts,
   editProduct,
   editProductAdd,
   userList,
   toggleBlockStatusUser,
   searchUser
}