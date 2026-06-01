import { useCallback, useRef, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

export default function MessageInput() {
  const { state, handleQuestion } = useChatContext();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = state !== "ready";

  const submit = useCallback(async () => {
    const q = value.trim();
    if (!q || isDisabled) return;
    setValue("");
    await handleQuestion(q);
    textareaRef.current?.focus();
  }, [value, isDisabled, handleQuestion]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="border-t border-slate-100 bg-white/80 backdrop-blur-sm p-3 rounded-b-2xl">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          placeholder={isDisabled ? "Upload a PDF to start chatting…" : "Ask a question…"}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-40 transition-all"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={submit}
          disabled={isDisabled || !value.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 transition-all"
        >
          {state === "chatting" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-1.5 text-right text-xs text-slate-400">Enter to send · Shift+Enter for newline</p>
    </div>
  );
}
