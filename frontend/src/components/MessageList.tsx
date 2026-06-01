import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

export default function MessageList() {
  const { messages, state } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.length === 0 && (
        <p className="text-center text-sm text-slate-400 mt-8">
          Ask anything about your PDF…
        </p>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={[
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-white text-slate-800 ring-1 ring-slate-100 rounded-bl-sm",
            ].join(" ")}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <SourcesAccordion sources={msg.sources} />
            )}
          </div>
        </div>
      ))}

      {state === "chatting" && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
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

function SourcesAccordion({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border-t border-slate-100 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        {open ? "▲ Hide sources" : "▼ Show sources"}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {sources.map((s, i) => (
            <p
              key={i}
              className="rounded bg-slate-50 p-2 text-xs text-slate-600 ring-1 ring-slate-100 line-clamp-4"
            >
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
