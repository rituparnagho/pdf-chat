import { useCallback, useRef, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

export default function FileUpload() {
  const { state, uploadedFile, handleUpload, handleReset } = useChatContext();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback(
    (file: File) => { if (file.type === "application/pdf") handleUpload(file); },
    [handleUpload]
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  if (state === "ready" || state === "chatting") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">📄</div>
          <div>
            <p className="font-semibold text-emerald-800 text-sm">{uploadedFile?.filename}</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              ✓ {uploadedFile?.chunkCount} chunks indexed and ready
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all"
        >
          New PDF
        </button>
      </div>
    );
  }

  const isLoading = state === "uploading" || state === "processing";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={[
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-14 text-center transition-all duration-200",
        dragging
          ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md",
        isLoading ? "pointer-events-none" : "",
      ].join(" ")}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">📄</div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white">
              <div className="w-full h-full rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {state === "uploading" ? "Uploading PDF…" : "Indexing document…"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {state === "processing" ? "Generating embeddings, this takes a moment" : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform ${dragging ? "scale-110" : ""} bg-gradient-to-br from-indigo-50 to-violet-50`}>
            📄
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700">Drop your PDF here</p>
            <p className="text-sm text-slate-400 mt-1">or <span className="text-indigo-500 font-medium">click to browse</span></p>
          </div>
          <p className="text-xs text-slate-300 mt-1">PDF files only</p>
        </div>
      )}
    </div>
  );
}
