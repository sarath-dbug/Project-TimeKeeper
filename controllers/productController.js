
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const Brand = require('../models/brandModel')


const product = async (req, res) => {
    try {
       
       const err = req.query.err
       const msg =req.query.msg
 
       const categorieData = await Category.find({});
       const brandData = await Brand.find({});
       if (err) {
          res.render('addProduct', { categories: categorieData, message: '', errMessage:msg})
       } else {
          res.render('addProduct', { categories: categorieData, brands:brandData, message:msg, errMessage: '' })
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
       const findbrand = await Brand.findOne({ _id: brand });
 
       var product = new Product({
          product_name: product_name,
          description: description,
          brand: findbrand.name,
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
       const brandData = await Brand.find({})
       const productData = await Product.find({})
       res.render('productList', { categories: categorieData, products: productData ,brands:brandData})
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
       const brandData = await Brand.find({})
       if(err){
          res.render('editProduct',{message:"",errMessage:err,categories: categorieData, products: productData, brands:brandData})
       }else{
          res.render('editProduct',{message:msg,errMessage:"",categories: categorieData, products: productData, brands:brandData})
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
       const brandData = await Brand.find({})
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
       res.render('productList',{categories:categorieData,products:productData, brands:brandData})
     } catch (error) {
       console.log(error.message);
     }
 }
 

 const removeImage = async (req, res) => {
   try {
     const productId = req.query.productId;
     const imageIndex = req.query.imageIndex;
 
     if (!productId || !imageIndex) {
       return res.status(400).json({ error: 'productId and imageIndex are required' });
     }
 
     const numericImageIndex = parseInt(imageIndex, 10);
 
     const update = {
       $unset: {}
     };
     update.$unset[`image.${numericImageIndex}`] = '';
 
     const product = await Product.findByIdAndUpdate(productId, update);
 
     if (!product) {
       return res.status(404).json({ error: 'Product not found' });
     }
     const productData = await Product.findById(productId).populate('category');
     const categorieData = await Category.find({})
     const brandData = await Brand.find({})
 
     res.render("editProduct",{message:"",errMessage:"",categories: categorieData, products: productData, brands:brandData});
   } catch (error) {
     console.log(error);
     res.status(500).json({ error: 'An error occurred while removing the image' });
   }
 }
 


 module.exports = {
    product,
   addProduct,
   productList,
   toggleBlockStatusProducts,
   editProduct,
   editProductAdd,
   removeImage
 }