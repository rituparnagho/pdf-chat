export type AppState = "idle" | "uploading" | "processing" | "ready" | "chatting";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export interface UploadedFile {
  sessionId: string;
  filename: string;
  chunkCount: number;
}
