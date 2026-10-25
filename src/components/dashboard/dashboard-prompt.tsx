"use client";

import { useState } from "react";
import { ArrowUp, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const STARTER_PROMPTS = [
  "Distributed WebSocket cluster with Redis Pub/Sub",
  "PostgreSQL schema with Row-Level Security for multi-tenant teams",
  "Event-driven microservices with Kafka & Dead-Letter Queue",
];

// Interactive AI prompt input on the dashboard for initiating workspaces.
export function DashboardPrompt() {
  const [prompt, setPrompt] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Workspace creation from prompt will be wired in Phase 3
    }
  };

  return (
    <section className="mx-auto mb-12 w-full max-w-4xl text-left">
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-foreground" />
        <span>AI Copilot · Workspace Orchestrator</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        What system are we designing today?
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Describe your target architecture, and CloudFlow will scaffold the canvas diagram and technical specification simultaneously.
      </p>

      {/* Prompt Input Box */}
      <div
        data-ui
        className="mt-6 rounded-xl border border-border bg-card p-3.5 transition-colors focus-within:border-foreground/60 focus-within:ring-1 focus-within:ring-foreground/20"
      >
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground mb-1.5">
          <Terminal className="size-3 text-muted-foreground" />
          <span>prompt:architecture-brief</span>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Design a high-throughput video streaming pipeline with CDN, object storage, and transcode workers..."
          rows={2}
          className="min-h-16 w-full resize-none bg-transparent px-1 py-1 text-sm sm:text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
        />

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2.5 px-1">
          <span className="text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-semibold">↵ Enter</kbd> to submit, <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-semibold">Shift + Enter</kbd> for new line
          </span>
          <Button
            size="sm"
            disabled={!prompt.trim()}
            aria-label="Submit prompt"
            className="size-8 rounded-lg transition-transform active:scale-95 p-0"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Templates:</span>
        {STARTER_PROMPTS.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => setPrompt(starter)}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            {starter}
          </button>
        ))}
      </div>
    </section>
  );
}
