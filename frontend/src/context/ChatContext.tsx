import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { deleteSession, streamQuestion, uploadPDF } from "@/api/client";
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

const STORAGE_KEY = "pdf-chat-history";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>("idle");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Restore chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { file, msgs, sessionId } = JSON.parse(saved);
        if (file && msgs && sessionId) {
          setUploadedFile(file);
          setMessages(msgs);
          sessionIdRef.current = sessionId;
          setState("ready");
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist chat history whenever messages or file changes
  useEffect(() => {
    if (uploadedFile && sessionIdRef.current) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          file: uploadedFile,
          msgs: messages,
          sessionId: sessionIdRef.current,
        })
      );
    }
  }, [messages, uploadedFile]);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setState("uploading");
    try {
      setState("processing");
      const data = await uploadPDF(file);
      sessionIdRef.current = data.session_id;
      const uploaded: UploadedFile = {
        sessionId: data.session_id,
        filename: data.filename,
        chunkCount: data.chunk_count,
      };
      setUploadedFile(uploaded);
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

    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setState("chatting");

    try {
      await streamQuestion(sessionIdRef.current, question, {
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, sources } : m))
          );
        },
        onDelta: (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + delta } : m
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          );
        },
        onError: (msg) => {
          setError(msg);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
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
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ChatContext.Provider
      value={{ state, uploadedFile, messages, error, handleUpload, handleQuestion, handleReset }}
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
