"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  workspaceName: string;
}

export function AIAssistantDrawer({
  open,
  onClose,
  workspaceName,
}: AIAssistantDrawerProps) {
  const [width, setWidth] = useState(440);
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = width;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const delta = startX - moveEvent.clientX;
      const maxWidth = typeof window !== "undefined" ? Math.min(window.innerWidth * 0.75, 850) : 850;
      const newWidth = Math.min(Math.max(startWidth + delta, 340), maxWidth);
      setWidth(newWidth);
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <>
      {/* Backdrop for small screens */}
      <div
        className={`fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-30 transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in & Slide-out Resizable Drawer */}
      <aside
        style={{ width: `${width}px` }}
        className={`fixed top-16 bottom-0 right-0 z-40 max-w-[90vw] border-l border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isResizing ? "transition-none select-none" : ""
        } ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Left Resize Edge Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-50 group hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors"
          title="Drag to resize sidebar width"
        >
          <div className="absolute left-1.5 top-0 bottom-0 w-px group-hover:w-0.5 group-hover:bg-cyan-400/80 transition-all" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between h-14 px-4 sm:px-5 border-b border-border/80 bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="size-4.5" />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">AI Assistant</h3>
          </div>

          {/* Close Drawer Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Close AI Assistant"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm leading-relaxed">
          <div className="flex gap-3 justify-start">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 mt-0.5">
              <Bot className="size-4" />
            </div>
            <div className="rounded-2xl p-3.5 max-w-[88%] text-sm leading-relaxed border border-border/80 bg-background/80 text-foreground">
              Hello! I am your AI Architecture Assistant for &quot;{workspaceName}&quot;. Ask me to draft technical specifications, design cloud topologies, or review system bottlenecks.
            </div>
          </div>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={(e) => e.preventDefault()} className="p-3 sm:p-4 border-t border-border/80 bg-card shrink-0">
          <div className="relative">
            <Textarea
              placeholder="Ask AI Assistant to sketch or write..."
              rows={2}
              className="w-full pr-11 bg-background border-border text-foreground text-sm resize-none rounded-xl py-2.5 px-3"
            />
            <Button
              type="button"
              size="sm"
              className="absolute right-2 bottom-2 size-8 p-0 rounded-lg font-bold"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
