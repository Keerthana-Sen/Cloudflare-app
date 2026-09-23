import { createRoot } from "react-dom/client";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useEffect, useRef, useState } from "react";

function App() {
  const agent = useAgent({ agent: "ChatAgent" });

  // Workaround for a known bug: getHttpUrl() returns "" before the
  // WebSocket connects, which crashes useAgentChat() internally.
  // https://github.com/cloudflare/agents/issues/1356
  const nativeGetHttpUrlRef = useRef(agent.getHttpUrl);
  agent.getHttpUrl = () => {
    const url = nativeGetHttpUrlRef.current?.() ?? "";
    return url || "http://localhost";
  };

  const { messages, sendMessage, status, clearHistory } = useAgentChat({ agent });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "streaming" || status === "submitted";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>AI Agent Chat</h1>
            <p style={styles.subtitle}>GLM-4.7-Flash · Workers AI · Durable Objects</p>
          </div>
          <button
            type="button"
            onClick={() => clearHistory?.()}
            style={styles.clearButton}
            title="Clear conversation"
          >
            Clear
          </button>
        </header>

        <div style={styles.messages} ref={scrollRef}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>Say hello to get started.</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.bubbleRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant),
                }}
              >
                {msg.parts.map((part, i) =>
                  part.type === "text" ? <span key={i}>{part.text}</span> : null
                )}
              </div>
            </div>
          ))}
          {isBusy && (
            <div style={{ ...styles.bubbleRow, justifyContent: "flex-start" }}>
              <div style={{ ...styles.bubble, ...styles.bubbleAssistant, ...styles.typing }}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: "0.15s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
            disabled={isBusy}
          />
          <button type="submit" disabled={isBusy || !input.trim()} style={styles.sendButton}>
            {isBusy ? "…" : "Send"}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,rgb(210, 88, 6),rgb(246, 141, 96))",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    height: "80vh",
    maxHeight: 720,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(243, 168, 94, 0.92)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid rgb(243, 160, 92)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" },
  subtitle: { margin: "2px 0 0", fontSize: 12, color: "#64748b" },
  clearButton: {
    border: "1px solid rgb(236, 143, 28)",
    background: "rgb(236, 143, 28)",
    color: "#ffffff",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f8fafc",
  },
  emptyState: {
    margin: "auto",
    color: "#94a3b8",
    fontSize: 14,
  },
  bubbleRow: { display: "flex" },
  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleUser: {
    background: "rgb(243, 136, 6)",
    color: "#ffffff",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    background: "#e2e8f0",
    color: "#0f172a",
    borderBottomLeftRadius: 4,
  },
  typing: { display: "flex", gap: 4, padding: "14px 16px" },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#64748b",
    display: "inline-block",
    animation: "bounce 1s infinite",
  },
  form: {
    display: "flex",
    gap: 8,
    padding: 16,
    borderTop: "1px solid rgb(224, 149, 50)",
    background: "#ffffff",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(243, 136, 6, 0.93)",
    fontSize: 14,
    outline: "none",
  },
  sendButton: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "rgb(246, 141, 96)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
};

createRoot(document.getElementById("root")!).render(<App />);