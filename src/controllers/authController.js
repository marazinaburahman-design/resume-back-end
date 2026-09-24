const bcrypt=require("bcryptjs");
const User=require("../models/User");
const {createToken,cookieOptions}=require("../utils/jwt");
const {registerSchema,loginSchema}=require("../utils/validation");

async function register(req,res,next){
  try{
    const data=registerSchema.parse(req.body);
    const existing=await User.findOne({email:data.email});
    if(existing) return res.status(409).json({message:"Email already registered"});

    const password=await bcrypt.hash(data.password,12);
    const user=await User.create({name:data.name,email:data.email,password});
    const token=createToken(user._id.toString());

    res.cookie("token",token,cookieOptions());
    res.status(201).json({
      message:"Registration successful",
      user:{id:user._id,name:user.name,email:user.email}
    });
  }catch(error){next(error);}
}

async function login(req,res,next){
  try{
    const data=loginSchema.parse(req.body);
    const user=await User.findOne({email:data.email}).select("+password");

    if(!user) return res.status(401).json({message:"Invalid email or password"});

    const ok=await bcrypt.compare(data.password,user.password);
    if(!ok) return res.status(401).json({message:"Invalid email or password"});

    const token=createToken(user._id.toString());
    res.cookie("token",token,cookieOptions());

    res.json({
      message:"Login successful",
      user:{id:user._id,name:user.name,email:user.email}
    });
  }catch(error){next(error);}
}

function logout(req,res){
  res.clearCookie("token",cookieOptions());
  res.json({message:"Logged out successfully"});
}

function me(req,res){
  res.json({user:req.user});
}

module.exports={register,login,logout,me};