import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

export function chunkText(text, chunkSize = 800, overlap = 100) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 <= chunkSize) {
      current = current ? `${current}\n\n${para}` : para;
    } else {
      if (current) chunks.push(current);
      const tail = current.slice(-overlap);
      current = tail ? `${tail}\n\n${para}` : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
