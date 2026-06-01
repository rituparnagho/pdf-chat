// In-memory session store — one entry per uploaded PDF
const sessions = new Map();

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function createSession(sessionId, chunks, embeddings) {
  sessions.set(sessionId, { chunks, embeddings });
  return chunks.length;
}

export function querySession(sessionId, queryEmbedding, topK = 4) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  return session.chunks
    .map((chunk, i) => ({ chunk, score: cosineSimilarity(queryEmbedding, session.embeddings[i]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(r => r.chunk);
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}
