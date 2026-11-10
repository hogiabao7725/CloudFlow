"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceAISidebarProps {
  open: boolean;
  onClose: () => void;
  workspaceName?: string;
  onInsertSnippet?: (snippet: string) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function WorkspaceAISidebar({
  open,
  onClose,
}: WorkspaceAISidebarProps) {
  const [input, setInput] = useState("");
  const messages: Message[] = [
    {
      id: "initial-1",
      role: "assistant",
      text: "I am CloudFlow AI. How can I help you?",
    },
  ];

  if (!open) return null;

  return (
    <aside className="w-full h-full bg-card/30 flex flex-col select-none overflow-hidden border-l border-border/70">
      {/* Header */}
      <div className="flex items-center justify-between h-11 px-3.5 border-b border-border/70 shrink-0 bg-card/40">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="size-4 text-cyan-400" />
          <span className="text-sm font-semibold text-foreground">
            CloudFlow AI
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Close AI"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-md leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-secondary text-foreground ml-3 border border-border/60"
                : "bg-card/70 border border-border/70 text-foreground/90 mr-2"
            }`}
          >
            <div className="text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
              {m.role === "assistant" ? (
                <>
                  <Sparkles className="size-3 text-cyan-400" />
                  <span>CloudFlow AI</span>
                </>
              ) : (
                <span>You</span>
              )}
            </div>
            <div className="text-sm leading-relaxed text-foreground/90">{m.text}</div>
          </div>
        ))}
      </div>

      {/* Input Field - typing allowed, send disabled with no event */}
      <div className="p-3 border-t border-border/70 flex items-center gap-2 bg-card/40 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CloudFlow AI..."
          className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
        />
        <Button
          type="button"
          size="sm"
          disabled
          className="h-9 px-3 text-sm opacity-50 cursor-not-allowed"
          title="AI Assistant preview"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </aside>
  );
}
