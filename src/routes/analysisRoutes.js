const express = require("express");
const { analyzeResume } = require("../services/aiService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Accept resume text directly (skip PDF extraction)
    const { resumeText, jobTitle } = req.body;

    if (!resumeText || !jobTitle) {
      return res.status(400).json({
        message: "resumeText and jobTitle are required",
      });
    }

    const analysis = await analyzeResume({ 
      resumeText: resumeText.trim(), 
      jobTitle 
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;