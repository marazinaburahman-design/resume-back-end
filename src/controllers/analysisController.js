const Analysis = require("../models/Analysis");
const { analyzeResume } = require("../services/aiService");
const { analyzeSchema } = require("../utils/validation");

// =====================================================
// CREATE ANALYSIS FROM EXTRACTED PDF TEXT
// =====================================================

async function createAnalysisFromText(req, res, next) {
  try {
    console.log("=================================");
    console.log("CREATE ANALYSIS REQUEST");
    console.log("=================================");

    console.log("User:", req.user?._id);
    console.log("Body:", req.body);

    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Get values from frontend
    const { resumeText, jobTitle } = req.body;

    // Validate resume text
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: "Resume text is required",
      });
    }

    // Validate job title using your existing schema
    const validated = analyzeSchema.parse({
      jobTitle,
    });

    console.log("Job title:", validated.jobTitle);
    console.log("Resume text length:", resumeText.length);

    // =====================================================
    // AI ANALYSIS
    // =====================================================

    console.log("Sending resume to AI...");

    const aiResult = await analyzeResume({
      resumeText: resumeText.trim(),
      jobTitle: validated.jobTitle,
    });

    console.log("AI result:", aiResult);

    // =====================================================
    // SAVE TO MONGODB
    // =====================================================

    const analysis = await Analysis.create({
      user: req.user._id,

      jobTitle: validated.jobTitle,

      // Frontend sends text, not the actual PDF file
      fileName: "Uploaded Resume.pdf",

      score: aiResult.score,
      summary: aiResult.summary,

      skillsFound: aiResult.skillsFound || [],
      missingSkills: aiResult.missingSkills || [],
      suggestions: aiResult.suggestions || [],

      provider: process.env.AI_PROVIDER || "mock",
    });

    console.log("Analysis saved:", analysis._id);

    // =====================================================
    // SEND RESULT TO FRONTEND
    // =====================================================

    return res.status(201).json({
      message: "Resume analyzed successfully",

      analysisId: analysis._id.toString(),

      analysis,
    });
  } catch (error) {
    console.error("CREATE ANALYSIS ERROR:");
    console.error(error);

    next(error);
  }
}

// =====================================================
// GET ALL ANALYSES
// =====================================================

async function getAnalyses(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const analyses = await Analysis.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// GET ONE ANALYSIS
// =====================================================

async function getAnalysisById(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).select("-__v");

    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found",
      });
    }

    return res.json({
      analysis,
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// DELETE ANALYSIS
// =====================================================

async function deleteAnalysis(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found",
      });
    }

    return res.json({
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createAnalysisFromText,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
};