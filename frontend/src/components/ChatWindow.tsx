import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

export default function ChatWindow() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" style={{ height: "560px" }}>
      <MessageList />
      <MessageInput />
    </div>
  );
}
