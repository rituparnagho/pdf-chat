const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

export interface UploadResponse {
  session_id: string;
  filename: string;
  chunk_count: number;
  message: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export async function uploadPDF(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail ?? "Upload failed");
  }
  return res.json();
}

export async function askQuestion(
  sessionId: string,
  question: string
): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat failed" }));
    throw new Error(err.detail ?? "Chat failed");
  }
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${BASE}/session/${sessionId}`, { method: "DELETE" });
}
