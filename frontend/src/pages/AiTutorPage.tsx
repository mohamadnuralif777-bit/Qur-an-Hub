import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, RotateCcw } from "lucide-react";
import type { ChatMessage } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SESSION_KEY = "ai_tutor_session";

function getOrCreateSession(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function AiTutorPage() {
  const [searchParams] = useSearchParams();
  const contextId = searchParams.get("context");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "As-salamu alaykum! I'm your AI Tutor. Ask me anything about Islamic knowledge — Quran, Hadith, Tafsir, or Sirah. 🌙" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "AI Tutor – Quran Hub";
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          content_id: contextId || undefined,
          session_id: getOrCreateSession(),
        }),
        signal: ctrl.signal,
      });

      if (!response.ok) throw new Error("Failed to connect");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                accumulated += parsed.delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: accumulated };
                  return updated;
                });
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([{ role: "assistant", content: "As-salamu alaykum! I'm your AI Tutor. Ask me anything about Islamic knowledge. 🌙" }]);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-ui flex flex-col">
      {/* Header */}
      <div className="bg-primary-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Tutor</h1>
            <p className="text-xs text-gray-300">
              {contextId ? "Answering with content context" : "Islamic Knowledge Assistant"}
            </p>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="p-2 rounded-full hover:bg-primary-800 transition-colors"
          title="Clear conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "user"
                ? "bg-primary-600 text-white"
                : "bg-gold/20 text-gold"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-tr-sm"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-tl-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && msg.content === "" && isStreaming && (
                <LoadingSpinner size="sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Quran, Hadith, Tafsir, or Sirah..."
            rows={1}
            className="flex-1 resize-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
