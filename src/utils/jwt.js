const jwt=require("jsonwebtoken");

function createToken(userId){
  return jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN||"7d"
  });
}

function cookieOptions(){
  const production=process.env.NODE_ENV==="production";
  return {
    httpOnly:true,
    secure:production,
    sameSite:production?"none":"lax",
    maxAge:7*24*60*60*1000,
    path:"/"
  };
}

module.exports={createToken,cookieOptions};