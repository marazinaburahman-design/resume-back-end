const pdfParse = require("pdfjs-dist/legacy/build/pdf");

async function extractTextFromPdf(buffer) {
  try {
    // Set the worker source to CDN version
    pdfParse.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfParse.version}/pdf.worker.min.js`;

    const pdf = await pdfParse.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      } catch (error) {
        console.error(`Error on page ${i}:`, error.message);
      }
    }

    if (!fullText.trim()) {
      throw new Error("No text extracted from PDF");
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
}

module.exports = { extractTextFromPdf };