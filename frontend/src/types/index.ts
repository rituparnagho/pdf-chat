export type AppState = "idle" | "uploading" | "processing" | "ready" | "chatting";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  streaming?: boolean;
}

export interface UploadedFile {
  sessionId: string;
  filename: string;
  chunkCount: number;
}
