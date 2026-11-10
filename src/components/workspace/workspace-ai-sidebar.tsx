"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceAISidebarProps {
  open: boolean;
  onClose: () => void;
  workspaceName: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function WorkspaceAISidebar({
  open,
  onClose,
  workspaceName,
}: WorkspaceAISidebarProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: `Hello! I can help you draft and review technical specifications for "${workspaceName}". You can ask me to draft NFR metrics, sequence flows, or architectural recommendations.`,
    },
  ]);

  if (!open) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <aside className="w-full h-full bg-card/30 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between h-11 px-3.5 border-b border-border/70 text-sm font-semibold shrink-0">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="size-4 text-cyan-400" />
          <span>AI Assistant</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-7 p-0 text-muted-foreground hover:text-foreground"
          title="Close AI Assistant"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-md leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-secondary text-foreground ml-3 border border-border/60"
                : "bg-card border border-border/70 text-foreground/90 mr-3"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/70 flex items-center gap-2 bg-card/20 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask AI assistant..."
          className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-9 px-3 text-sm"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </aside>
  );
}
