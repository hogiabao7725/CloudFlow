"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Copy, Check, Plus } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  value: string;
}

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded bg-background/50 hover:bg-secondary border border-border/60"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

interface DocumentCodeBlockProps {
  displayLabel: string;
  rawCode: string;
  className?: string;
  children: ReactNode;
  onInsert?: (code: string) => void;
}

export function DocumentCodeBlock({
  displayLabel,
  rawCode,
  className,
  children,
  onInsert,
}: DocumentCodeBlockProps) {
  return (
    <div className="relative my-3.5 rounded-lg border border-border/80 bg-card/60 overflow-hidden font-mono text-xs sm:text-[13.5px] shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-secondary/40 border-b border-border/60 text-[11px] select-none">
        <span className="uppercase text-zinc-400 font-mono font-medium text-[10px] sm:text-[11px] tracking-wider">
          {displayLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <CopyButton value={rawCode} />
          {onInsert && (
            <button
              type="button"
              onClick={() => onInsert(rawCode)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded bg-background/50 hover:bg-secondary border border-border/60"
              title="Insert into document"
            >
              <Plus className="size-3" />
              <span>Insert</span>
            </button>
          )}
        </div>
      </div>
      <pre className="p-3.5 overflow-x-auto leading-relaxed text-xs sm:text-[13.5px] text-foreground/95 bg-card/30">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
