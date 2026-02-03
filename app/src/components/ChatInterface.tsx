"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import { ClientSelector } from "./ClientSelector";
import { Client } from "@/lib/clients";
import { Agent } from "@/lib/agents";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          agentId: agent.id,
          clientId: selectedClient?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check that your API key is configured in `.env.local` and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: agent.color }}
          >
            {agent.name[0]}
          </div>
          <div>
            <h1 className="font-semibold text-base">{agent.name} Agent</h1>
            <p className="text-xs text-muted">{agent.description.split(",")[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClientSelector
            selectedClientId={selectedClient?.id || null}
            onSelect={setSelectedClient}
          />
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <EmptyState agent={agent} selectedClient={selectedClient} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-white border border-border rounded-bl-md chat-message"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-muted" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-white">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-border p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask the ${agent.name} agent...`}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-1.5 text-sm placeholder:text-muted/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-accent text-white disabled:opacity-40 hover:bg-accent/90 transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          {selectedClient && (
            <p className="text-xs text-muted mt-2 px-2">
              Context: <span className="font-medium">{selectedClient.name}</span> — {selectedClient.industry}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function EmptyState({ agent, selectedClient }: { agent: Agent; selectedClient: Client | null }) {
  const suggestions: Record<string, string[]> = {
    "media-strategy": [
      "Build a media plan for Q2 with a $50K budget",
      "What channels should we prioritize for B2B lead gen?",
      "Analyze our current channel mix and suggest optimizations",
      "What are current CPM benchmarks for social media?",
    ],
    seo: [
      "Run a technical SEO audit checklist for us",
      "Suggest a keyword strategy for our top service pages",
      "How should we improve our local SEO presence?",
      "Create a content calendar based on search intent",
    ],
    sales: [
      "Research this prospect and identify their pain points",
      "Help me prepare talking points for a pitch meeting",
      "Draft a proposal for a full-service engagement",
      "What objections should I expect and how do I handle them?",
    ],
    operations: [
      "Help me plan resource allocation for next quarter",
      "What should our target utilization rate be?",
      "Create an onboarding checklist for a new client",
      "Analyze our current margins and suggest improvements",
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4"
        style={{ backgroundColor: agent.color }}
      >
        {agent.name[0]}
      </div>
      <h2 className="text-lg font-semibold mb-1">{agent.name} Agent</h2>
      <p className="text-sm text-muted mb-6">{agent.description}</p>
      {selectedClient && (
        <p className="text-sm text-accent mb-4 bg-blue-50 px-3 py-1.5 rounded-full">
          Working with: {selectedClient.name}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        {(suggestions[agent.id] || []).map((s, i) => (
          <button
            key={i}
            className="text-left text-sm p-3 rounded-xl border border-border hover:bg-white hover:shadow-sm transition-all text-muted hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatMessage(content: string): string {
  // Basic markdown-like formatting
  let html = content
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, "<li>$1</li>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Paragraphs — wrap lines that aren't already wrapped in tags
  html = html
    .split("\n\n")
    .map((block) => {
      if (block.match(/^<(h[1-3]|ul|ol|pre|li)/)) return block;
      if (block.trim() === "") return "";
      return `<p>${block}</p>`;
    })
    .join("\n");

  return html;
}
