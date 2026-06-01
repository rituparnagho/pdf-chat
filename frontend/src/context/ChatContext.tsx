import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { askQuestion, deleteSession, uploadPDF } from "@/api/client";
import type { AppState, Message, UploadedFile } from "@/types";

interface ChatContextValue {
  state: AppState;
  uploadedFile: UploadedFile | null;
  messages: Message[];
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  handleQuestion: (question: string) => Promise<void>;
  handleReset: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>("idle");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setState("uploading");
    try {
      setState("processing");
      const data = await uploadPDF(file);
      sessionIdRef.current = data.session_id;
      setUploadedFile({
        sessionId: data.session_id,
        filename: data.filename,
        chunkCount: data.chunk_count,
      });
      setMessages([]);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("idle");
    }
  }, []);

  const handleQuestion = useCallback(async (question: string) => {
    if (!sessionIdRef.current) return;
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setState("chatting");

    try {
      const data = await askQuestion(sessionIdRef.current, question);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setState("ready");
    }
  }, []);

  const handleReset = useCallback(() => {
    if (sessionIdRef.current) {
      deleteSession(sessionIdRef.current).catch(() => {});
      sessionIdRef.current = null;
    }
    setUploadedFile(null);
    setMessages([]);
    setError(null);
    setState("idle");
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        uploadedFile,
        messages,
        error,
        handleUpload,
        handleQuestion,
        handleReset,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}
