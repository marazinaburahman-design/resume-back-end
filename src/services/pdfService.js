const pdf = require("pdf-parse");

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text.trim();
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
}

module.exports = { extractTextFromPdf };