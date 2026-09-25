const express = require("express");

const {
  createAnalysisFromText,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
} = require("../controllers/analysisController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE ANALYSIS
router.post(
  "/",
  protect,
  createAnalysisFromText
);

// GET ALL ANALYSES
router.get(
  "/",
  protect,
  getAnalyses
);

// GET ONE ANALYSIS
router.get(
  "/:id",
  protect,
  getAnalysisById
);

// DELETE ANALYSIS
router.delete(
  "/:id",
  protect,
  deleteAnalysis
);

module.exports = router;