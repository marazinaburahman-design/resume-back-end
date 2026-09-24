const pdfParse=require("pdf-parse");

async function extractTextFromPdf(buffer){
  if(!buffer?.length) throw new Error("PDF file is empty");
  const result=await pdfParse(buffer);
  const text=result.text.trim();
  if(!text) throw new Error("Could not extract readable text from the PDF");
  return text;
}

module.exports={extractTextFromPdf};