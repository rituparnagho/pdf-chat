import { GoogleGenAI } from '@google/genai';

let _client = null;

function getClient() {
  if (!_client) _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _client;
}

export async function getEmbeddings(texts) {
  const model = process.env.EMBED_MODEL || 'gemini-embedding-001';
  const result = await getClient().models.embedContent({
    model,
    contents: texts,
    config: { taskType: 'RETRIEVAL_DOCUMENT' },
  });
  return result.embeddings.map(e => e.values);
}

export async function getQueryEmbedding(query) {
  const model = process.env.EMBED_MODEL || 'gemini-embedding-001';
  const result = await getClient().models.embedContent({
    model,
    contents: [query],
    config: { taskType: 'RETRIEVAL_QUERY' },
  });
  return result.embeddings[0].values;
}
