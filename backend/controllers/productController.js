
const Product= require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors =  require("../middleware/catchasyncError");
const ApiFeatures = require("../utils/apifeatures");

//Create Product --- Admin

exports.createProduct = catchAsyncErrors(async (req,res,next)=>{

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
});

// Get  All Products
exports.getAllProducts = catchAsyncErrors(async (req,res)=>{


    const resultPerPage = 5;
    const productCount = await Product.countDocuments();


   const apiFeature=  new  ApiFeatures(Product.find(),req.query)
   .search()
   .filter()
   .pagination(resultPerPage);
   const products =  await apiFeature.query;
    
   
   res.status(200).json({
        success:true,
        products
    })

}) ;

//Get Product details 
exports.getProdutDetails = catchAsyncErrors(async (req,res,next)=>{

    const product =await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not Found",404));
    }

    res.status(200).json({
        success:true,
        product,
        productCount
    })
});

//Update Product---Admin

exports.updateProduct = catchAsyncErrors(async (req,res,next)=>{
    let product = await  Product.findById(req.params.id);
    if(!product){
        next(new ErrorHandler("Product not Found",404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindModify:false
    });

    res.status(200).json({
        success:true,
        product
    })

});


//Delete Product---Admin


exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        next(new ErrorHandler("Product not Found",404));
    }

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })
});


