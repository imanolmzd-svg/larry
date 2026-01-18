import { PDFParse } from "pdf-parse";

type PageSpan = { pageNumber: number; startChar: number; endChar: number };

export async function extractPdfTextWithPageMap(pdfBuffer: Buffer): Promise<{
  fullText: string;
  pageSpans: PageSpan[];
}> {
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  await parser.destroy();

  if (result.pages.length === 0) {
    return { fullText: "", pageSpans: [] };
  }

  let cursor = 0;
  const pageSpans: PageSpan[] = [];
  const stitched: string[] = [];

  for (const page of result.pages) {
    const t = page.text.trim();
    if (!t) continue;
    const startChar = cursor;
    stitched.push(t);
    cursor += t.length + 1; // + newline
    const endChar = cursor;
    pageSpans.push({ pageNumber: page.num, startChar, endChar });
  }

  return { fullText: stitched.join("\n"), pageSpans };
}
