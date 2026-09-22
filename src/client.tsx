import { createRoot } from "react-dom/client";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useRef } from "react";

function App() {
  const agent = useAgent({ agent: "ChatAgent" });
  const { messages, sendMessage, status } = useAgentChat({ agent });

    // Patch known bug: getHttpUrl() returns "" before WS connects
  const nativeGetHttpUrlRef = useRef(agent.getHttpUrl);
  agent.getHttpUrl = () => {
    const url = nativeGetHttpUrlRef.current?.() ?? "";
    return url || "http://localhost";
  };


  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Chat</h2>
      <div style={{ marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong>{" "}
            {msg.parts.map((part, i) =>
              part.type === "text" ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("input") as HTMLInputElement;
          if (input.value.trim()) {
            sendMessage({ text: input.value });
            input.value = "";
          }
        }}
      >
        <input name="input" placeholder="Type a message..." style={{ width: 300 }} />
        <button type="submit" disabled={status === "streaming"}>
          Send
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);