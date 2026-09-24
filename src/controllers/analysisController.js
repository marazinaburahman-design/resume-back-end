const Analysis=require("../models/Analysis");
const {extractTextFromPdf}=require("../services/pdfService");
const {analyzeResume}=require("../services/aiService");
const {analyzeSchema}=require("../utils/validation");

async function createAnalysis(req,res,next){
  try{
    const {jobTitle}=analyzeSchema.parse(req.body);
    if(!req.file) return res.status(400).json({message:"Resume PDF is required"});

    const resumeText=await extractTextFromPdf(req.file.buffer);
    const aiResult=await analyzeResume({resumeText,jobTitle});

    const analysis=await Analysis.create({
      user:req.user._id,
      jobTitle,
      fileName:req.file.originalname,
      ...aiResult,
      provider:process.env.AI_PROVIDER||"mock"
    });

    res.status(201).json({message:"Resume analyzed successfully",analysis});
  }catch(error){next(error);}
}

async function getAnalyses(req,res,next){
  try{
    const analyses=await Analysis.find({user:req.user._id}).sort({createdAt:-1}).select("-__v");
    res.json({count:analyses.length,analyses});
  }catch(error){next(error);}
}

async function getAnalysisById(req,res,next){
  try{
    const analysis=await Analysis.findOne({_id:req.params.id,user:req.user._id});
    if(!analysis) return res.status(404).json({message:"Analysis not found"});
    res.json({analysis});
  }catch(error){next(error);}
}

async function deleteAnalysis(req,res,next){
  try{
    const analysis=await Analysis.findOneAndDelete({_id:req.params.id,user:req.user._id});
    if(!analysis) return res.status(404).json({message:"Analysis not found"});
    res.json({message:"Analysis deleted successfully"});
  }catch(error){next(error);}
}

module.exports={createAnalysis,getAnalyses,getAnalysisById,deleteAnalysis};