"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  Check,
  ListCollapse,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkspaceItem } from "@/types/workspace";
import { WorkspaceTitle } from "./workspace-title";
import { WorkspaceStatusSelect } from "./workspace-status-select";
import { WorkspacePresence } from "./workspace-presence";

interface WorkspaceHeaderProps {
  workspace: WorkspaceItem;
  outlineOpen: boolean;
  onToggleOutline: () => void;
  aiOpen: boolean;
  onToggleAi: () => void;
  onWorkspaceUpdated?: (updated: Partial<WorkspaceItem>) => void;
}

export function WorkspaceHeader({
  workspace,
  outlineOpen,
  onToggleOutline,
  aiOpen,
  onToggleAi,
  onWorkspaceUpdated,
}: WorkspaceHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Workspace link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/80 px-3 sm:px-4 h-12 shrink-0 select-none z-20 gap-2">
      {/* Left: Back, Outline toggle, Title & Status */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Link href="/dashboard" title="Back to Dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <span className="h-4 w-px bg-border shrink-0" />

        {/* Outline toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleOutline}
          className={`h-8 px-2 gap-1 text-xs shrink-0 ${
            outlineOpen
              ? "bg-secondary text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle Outline"
        >
          <ListCollapse className="size-3.5" />
          <span className="hidden sm:inline">Outline</span>
        </Button>

        <span className="h-4 w-px bg-border shrink-0" />

        <WorkspaceTitle
          workspace={workspace}
          onWorkspaceUpdated={onWorkspaceUpdated}
        />

        <WorkspaceStatusSelect
          workspace={workspace}
          onWorkspaceUpdated={onWorkspaceUpdated}
        />
      </div>

      {/* Right: Presence, Share & AI Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <WorkspacePresence workspaceId={workspace.id} />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="h-8 px-2.5 text-xs gap-1.5"
          title="Share link"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Share2 className="size-3.5" />
          )}
          <span className="hidden sm:inline">Share</span>
        </Button>

        <Button
          type="button"
          variant={aiOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleAi}
          className={`h-8 px-2.5 text-xs gap-1.5 ${
            aiOpen
              ? "bg-secondary text-foreground border border-border font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle Copilot Assistant"
        >
          <Sparkles className="size-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Copilot</span>
        </Button>
      </div>
    </header>
  );
}
