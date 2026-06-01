import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

export default function MessageList() {
  const { messages, state } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
            💬
          </div>
          <p className="text-slate-500 text-sm font-medium">Ask anything about your PDF</p>
          <p className="text-slate-400 text-xs">Your conversation will appear here</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
          {/* Avatar */}
          <div className={[
            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold",
            msg.role === "user"
              ? "bg-indigo-600 text-white"
              : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white",
          ].join(" ")}>
            {msg.role === "user" ? "U" : "AI"}
          </div>

          {/* Bubble */}
          <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={[
              "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-sm"
                : "bg-white text-slate-800 ring-1 ring-slate-100 rounded-tl-sm",
            ].join(" ")}>
              <p className="whitespace-pre-wrap">
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
                )}
              </p>
            </div>

            {/* Source references */}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && !msg.streaming && (
              <SourceReferences sources={msg.sources} />
            )}
          </div>
        </div>
      ))}

      {/* Typing indicator — shown only when state is chatting but no streaming message yet */}
      {state === "chatting" && messages[messages.length - 1]?.streaming === false && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            AI
          </div>
          <div className="bg-white ring-1 ring-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function SourceReferences({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {open ? "Hide" : "Show"} {sources.length} source{sources.length > 1 ? "s" : ""}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 space-y-2 w-full">
          {sources.map((s, i) => (
            <div key={i} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">
                  Source {i + 1}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
