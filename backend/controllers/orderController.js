const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchasyncError");



//Create new Order 
exports.newOrder = catchAsyncErrors (async(req,res,next)=>{
    const {shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,}
      = req.body;

      const order = await Order.create({
               
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
      });

      res.status(201).json({
        success:true,
        order,
      });
});


//Get SIngle Order 

exports.getSingleOrder = catchAsyncErrors(async (req,res,next)=>{

  const order = await Order.findById(req.params.id).populate("user","name email");

if(!order){
  return next(new ErrorHandler("Order not found with this Id ", 404));
}

res.status(200).json({
  success:true,
  order,
 });

});

//Get Orders for Logged in User  

exports.myOrders = catchAsyncErrors(async (req,res,next)=>{

  const orders = await Order.find({user:req.user._id});

if(!orders){
  return next(new ErrorHandler("Order not found with this Id ", 404));
}

res.status(200).json({
  success:true,
  orders,
 });

});



//Get all Orders received --Admin 

exports.getAllOrders = catchAsyncErrors(async (req, res, next )=>{
  const orders = await Order.find();

  let totalAmount=0;

  orders.forEach(order=>{
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success:true,
    totalAmount,
    orders,
  });
});

//Update Order status---Admin 

exports.updateOrder = catchAsyncErrors(async (req,res,next)=>{
  const order = await Order.findById(req.params.id);

  


  if(order.orderStatus.toLowerCase() ==="delivered"){
    return next(new ErrorHandler("Order already delivered",400));
}



order.orderItems.forEach(async (order)=>{
  await updateStock(order.product, order.quantity);
});

order.orderStatus = req.body.status;
if(req.body.status === "Delivered"){
  order.deliveredAt = Date.now();
}

await order.save({validateBeforeSave: false});
res.status(200).json({
  success:true,
});

});

//Update stock function 
async function updateStock(id,quantity){
 const product = await Product.findById(id);
 product.Stock -=quantity;

 await product.save({validateBeforeSave:false})
}


//Delete Order -- Admin 

exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
  const order = await Order.findById(req.params.id);

  if(!order){
    return next(new ErrorHandler("Order not found with this id ",404));
  }
  
  await order.deleteOne();

  res.status(200).json({
    success :true,
  })
})
