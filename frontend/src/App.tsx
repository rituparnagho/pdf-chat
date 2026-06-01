import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatWindow from "@/components/ChatWindow";
import FileUpload from "@/components/FileUpload";

function Inner() {
  const { state, error, messages } = useChatContext();
  const showChat = state === "ready" || state === "chatting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <span className="text-lg">🗂️</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">PDF Chat</h1>
              <p className="text-xs text-slate-400">Powered by Gemini + Groq</p>
            </div>
          </div>
          {messages.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <FileUpload />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {showChat && <ChatWindow />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <Inner />
    </ChatProvider>
  );
}
