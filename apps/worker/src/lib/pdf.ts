import PDFParser from "pdf2json";
import { debug, error } from "./logger.js";

type PageSpan = { pageNumber: number; startChar: number; endChar: number };

/**
 * Extract text from PDF buffer with per-page mappings.
 * Uses pdf2json (pure JavaScript, no canvas/DOM dependencies).
 */
export async function extractPdfTextWithPageMap(pdfBuffer: Buffer): Promise<{
  fullText: string;
  pageSpans: PageSpan[];
}> {
  debug("[pdf]", "Starting PDF text extraction", { bufferSize: pdfBuffer.length });
  
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        const message = errData?.parserError || "Unknown PDF parsing error";
        error("[pdf]", "PDF parser error", errData);
        reject(new Error(`PDF parsing failed: ${message}`));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const pages = pdfData.Pages || [];
          debug("[pdf]", "PDF data ready", { pageCount: pages.length });
          
          if (pages.length === 0) {
            debug("[pdf]", "PDF has no pages");
            resolve({ fullText: "", pageSpans: [] });
            return;
          }
          
          const pageTexts: string[] = [];
          const pageSpans: PageSpan[] = [];
          let cursor = 0;
          
          // Extract text from each page
          for (let i = 0; i < pages.length; i++) {
            debug("[pdf]", `Extracting text from page ${i + 1}/${pages.length}`);
            
            const page = pages[i];
            const pageText = extractTextFromPage(page);
            
            if (pageText) {
              const startChar = cursor;
              pageTexts.push(pageText);
              cursor += pageText.length + 1; // +1 for newline
              const endChar = cursor;
              
              pageSpans.push({
                pageNumber: i + 1,
                startChar,
                endChar,
              });
              
              debug("[pdf]", `Page ${i + 1} extracted`, { 
                chars: pageText.length,
                startChar,
                endChar,
              });
            } else {
              debug("[pdf]", `Page ${i + 1} has no text`);
            }
          }
          
          debug("[pdf]", "PDF extraction complete", {
            totalPages: pages.length,
            totalChars: pageTexts.join("\n").length,
          });
          
          resolve({
            fullText: pageTexts.join("\n"),
            pageSpans,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error processing PDF data";
          error("[pdf]", "Error processing PDF data", err);
          reject(new Error(`PDF processing failed: ${message}`));
        }
      });
      
      debug("[pdf]", "Parsing PDF buffer");
      pdfParser.parseBuffer(pdfBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown PDF parsing error";
      error("[pdf]", "Failed to initialize PDF parser", err);
      reject(new Error(`PDF parsing failed: ${message}`));
    }
  });
}

/**
 * Extract text content from a pdf2json page object.
 */
function extractTextFromPage(page: any): string {
  const texts: string[] = [];
  
  if (!page.Texts || !Array.isArray(page.Texts)) {
    return "";
  }
  
  for (const textItem of page.Texts) {
    if (textItem.R && Array.isArray(textItem.R)) {
      for (const run of textItem.R) {
        if (run.T) {
          // Decode URI-encoded text
          const decoded = decodeURIComponent(run.T);
          texts.push(decoded);
        }
      }
    }
  }
  
  return texts.join(" ").trim();
}
