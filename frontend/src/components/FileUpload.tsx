import { useCallback, useRef, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

export default function FileUpload() {
  const { state, uploadedFile, handleUpload, handleReset } = useChatContext();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") return;
      handleUpload(file);
    },
    [handleUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
      e.target.value = "";
    },
    [onFile]
  );

  if (state === "ready" || state === "chatting") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-emerald-800">{uploadedFile?.filename}</p>
            <p className="text-sm text-emerald-600">
              {uploadedFile?.chunkCount} chunks indexed
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Upload new PDF
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
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-14 text-center transition-colors",
        dragging
          ? "border-indigo-400 bg-indigo-50"
          : "border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30",
        isLoading ? "pointer-events-none opacity-70" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onInputChange}
      />
      {isLoading ? (
        <>
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            {state === "uploading" ? "Uploading…" : "Extracting & indexing PDF…"}
          </p>
        </>
      ) : (
        <>
          <span className="mb-3 text-4xl">📄</span>
          <p className="text-base font-semibold text-slate-700">
            Drop your PDF here
          </p>
          <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        </>
      )}
    </div>
  );
}
