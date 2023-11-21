const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required:[true,"Please Enter your name "],
        maxLength:[30,"Name connot exceed more than  30 characters"],
        minLength:[4,"Name connot be less than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your Email"],
        unique:[true,"User with Email already exists"],
        validate:[validator.isEmail, "Please enter valid Email"]
    },

    password:{
        type:String,
        required:[true,"Please enter your Password"],
        minLength:[8,"Password cannot be less than 8 characters"],
        select:false,
    },
    avatar:
        {
            public_id:{
              type:String,
              required:true
            },
           url:{
              type:String,
              required:true
  
            }
       },

    role:{
        type:String,
        default:"user",
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,
      
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,10)
});


//JWT Token

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

// Compare Password

userSchema.methods.comparePassword =  async function(enteredPassword){

    return await  bcrypt.compare(enteredPassword,this.password);

};


//Reset Password Token 

userSchema.methods.getResetpasswordToken = function (){

 // Generating Token
 const resetToken = crypto.randomBytes(20).toString("hex");

 //Hashinng and adding resetPasswordToken to UserSchema 

 this.resetPasswordToken = crypto
 .createHash("sha256")
 .update(resetToken)
 .digest("hex");

 this.resetPasswordExpire = Date.now()+15*60*1000;

 return resetToken;

};


module.exports = mongoose.model("User",userSchema);
