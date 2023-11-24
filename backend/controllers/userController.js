const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors =  require("../middleware/catchasyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");



//Registration for User 


exports.rergisterUser= catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password}= req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample Id ",
            url:"profilepicurl"
        }
    });

    sendToken(user,201,res);
});

//Login User 

exports.loginUser = catchAsyncErrors(async (req,res,next)=>{

 const {email,password} =  req.body;


 //checking if User has given email and password both

 if(!email || !password){
     return next(new ErrorHandler("Please Enter Email & Password",400))
 }

 const user =  await User.findOne({ email}).select("+password");

 if(!user){
    return next(new ErrorHandler("Invalid Email or Password",401));
 }

 const isPasswordMatched = await user.comparePassword(password);

 if(!isPasswordMatched){
    return next(new ErrorHandler("Invalid Email or Password",401));
 }

 sendToken(user,200,res);

});

//Logout User

exports.logout = catchAsyncErrors(async ( req,res,next)=>{
  
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true,
    })
   
res.status(200).json({
    success:true,
    message:"Logged Out"
})
});

// Forgot Password 
exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not Found",404));

    }

    // Get ResetPassword Token

    const resetToken = user.getResetpasswordToken();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message =`Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have not requested this email then , please ignore  it `;

    try {

        await sendEmail({
            email:user.email,
            subject:`SAINIK KIRANA STORE account Recovery `,
            message,

        });
        
        res.status(200).json({
            success:true,
            message:`Email sent to  ${user.email} successfully`,
        })
        
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire= undefined;  
      await user.save({validateBeforeSave:false});

      return next(new ErrorHandler(error.message,500))
    }
});


//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
   
    //Creating Token Hash
 const resetPasswordToken = crypto
 .createHash("sha256")
 .update(req.params.token)
 .digest("hex"); 


 const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now() }, 
 });
if(!user){
    return next (new ErrorHandler("Reset Password Token is invalid or has been  expired ",404));

}

if(req.body.password !== req.body.confirmPassword){
   
    return next( new ErrorHandler("Password doesnt match",400))
}

user.password = req.body.password ;
user.resetPasswordToken=undefined;
user.resetPasswordExpire=undefined;

await user.save();

sendToken(user , 200 , res);

});


//Get User Details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    });
})

//Update User Password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password entered wrong",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password doesn't match",400));
    }

     user.password = req.body.newPassword;
     await user.save();

   sendToken(user,200,res);
})


///Updating ser profile

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body;

    // Check if both name and email are provided
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both name and email to update.',
        });
    }

    const newUserData = {
        name,
        email,
    };

    //We will add cloudinary later 
    
    const user = await User.findByIdAndUpdate(
        req.user.id,
        newUserData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        
    });
});
