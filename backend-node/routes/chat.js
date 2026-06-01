import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import Groq from 'groq-sdk';
import { extractTextFromPdf, chunkText } from '../services/pdfService.js';
import { getEmbeddings, getQueryEmbedding } from '../services/embeddingService.js';
import { createSession, querySession, deleteSession } from '../services/ragService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const SYSTEM_PROMPT =
  'You are a helpful assistant that answers questions based ONLY on the provided PDF document context. ' +
  "If the answer is not found in the context, say \"I couldn't find that information in the PDF.\" " +
  'Do not use knowledge outside of the provided context.';

let _groq = null;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ detail: 'Only PDF files are accepted.' });
    }

    const text = await extractTextFromPdf(req.file.buffer);
    if (!text.trim()) {
      return res.status(422).json({ detail: 'Could not extract text from PDF.' });
    }

    const chunkSize  = parseInt(process.env.CHUNK_SIZE   || '800');
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP || '100');
    const chunks = chunkText(text, chunkSize, chunkOverlap);

    const embeddings = await getEmbeddings(chunks);
    const sessionId  = uuidv4();
    const chunkCount = createSession(sessionId, chunks, embeddings);

    res.json({
      session_id:  sessionId,
      filename:    req.file.originalname,
      chunk_count: chunkCount,
      message:     `PDF indexed successfully into ${chunkCount} chunks.`,
    });
  } catch (err) {
    console.error('[upload]', err);
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { session_id, question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ detail: 'Question cannot be empty.' });
    }

    const queryEmbedding = await getQueryEmbedding(question);
    const topK   = parseInt(process.env.TOP_K_RESULTS || '4');
    const chunks = querySession(session_id, queryEmbedding, topK);

    const context   = chunks.join('\n\n---\n\n');
    const chatModel = process.env.CHAT_MODEL || 'llama-3.1-8b-instant';

    const completion = await getGroq().chat.completions.create({
      model: chatModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Context from PDF:\n\n${context}\n\nQuestion: ${question}` },
      ],
    });

    res.json({
      answer:  completion.choices[0].message.content || '',
      sources: chunks,
    });
  } catch (err) {
    console.error('[chat]', err);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ detail: err.message });
  }
});

// DELETE /api/session/:sessionId
router.delete('/session/:sessionId', (req, res) => {
  deleteSession(req.params.sessionId);
  res.json({ message: `Session ${req.params.sessionId} deleted.` });
});

export default router;
