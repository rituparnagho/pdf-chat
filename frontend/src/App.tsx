import { ChatProvider, useChatContext } from "@/context/ChatContext";
import ChatWindow from "@/components/ChatWindow";
import FileUpload from "@/components/FileUpload";

function Inner() {
  const { state, error } = useChatContext();
  const showChat = state === "ready" || state === "chatting";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="text-2xl">🗂️</span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">PDF Chat</h1>
            <p className="text-xs text-slate-500">Ask questions about any PDF</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        <FileUpload />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
