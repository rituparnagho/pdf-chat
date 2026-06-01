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

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${BASE}/session/${sessionId}`, { method: "DELETE" });
}

export interface StreamCallbacks {
  onSources: (sources: string[]) => void;
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export async function streamQuestion(
  sessionId: string,
  question: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question }),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ detail: "Stream failed" }));
    throw new Error(err.detail ?? "Stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;
      try {
        const event = JSON.parse(raw);
        if (event.type === "sources") callbacks.onSources(event.sources);
        else if (event.type === "delta") callbacks.onDelta(event.content);
        else if (event.type === "done") callbacks.onDone();
        else if (event.type === "error") callbacks.onError(event.message);
      } catch {
        // ignore malformed lines
      }
    }
  }
}
