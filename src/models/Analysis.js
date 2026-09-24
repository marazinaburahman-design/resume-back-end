const mongoose=require("mongoose");

const analysisSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  jobTitle:{type:String,required:true,trim:true,maxlength:150},
  fileName:{type:String,required:true},
  score:{type:Number,min:0,max:100,required:true},
  summary:{type:String,required:true},
  skillsFound:{type:[String],default:[]},
  missingSkills:{type:[String],default:[]},
  suggestions:{type:[String],default:[]},
  provider:{type:String,default:"mock"}
},{timestamps:true});

module.exports=mongoose.model("Analysis",analysisSchema);