const express=require("express");
const protect=require("../middleware/authMiddleware");
const upload=require("../middleware/uploadMiddleware");
const {createAnalysis,getAnalyses,getAnalysisById,deleteAnalysis}=require("../controllers/analysisController");

const router=express.Router();
router.use(protect);

router.post("/",upload.single("resume"),createAnalysis);
router.get("/",getAnalyses);
router.get("/:id",getAnalysisById);
router.delete("/:id",deleteAnalysis);

module.exports=router;