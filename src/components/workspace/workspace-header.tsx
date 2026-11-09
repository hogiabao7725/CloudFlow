"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkspaceItem } from "@/types/workspace";
import { WorkspaceTitle } from "./workspace-title";
import { WorkspaceStatusSelect } from "./workspace-status-select";
import { WorkspaceViewToggle, ViewMode } from "./workspace-view-toggle";

export type { ViewMode };

interface WorkspaceHeaderProps {
  workspace: WorkspaceItem;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  aiDrawerOpen: boolean;
  onToggleAiDrawer: () => void;
  onWorkspaceUpdated?: (updated: Partial<WorkspaceItem>) => void;
}

/**
 * Top control bar for the dual-view workspace room.
 * Assembles title rename, status selection, view mode switching, and collaborative actions.
 */
export function WorkspaceHeader({
  workspace,
  viewMode,
  onViewModeChange,
  aiDrawerOpen,
  onToggleAiDrawer,
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
    <header className="flex items-center justify-between border-b border-border bg-card/90 px-3 sm:px-5 h-14 shrink-0 select-none z-30 gap-2">
      {/* LEFT: Back to Dashboard, Title & Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Link href="/dashboard" title="Back to Dashboard">
            <ArrowLeft className="size-4.5 sm:mr-1.5" />
            <span className="hidden sm:inline font-medium text-sm">Dashboard</span>
          </Link>
        </Button>

        <span className="h-5 w-px bg-border/80 shrink-0" />

        <WorkspaceTitle
          workspace={workspace}
          onWorkspaceUpdated={onWorkspaceUpdated}
        />

        <WorkspaceStatusSelect
          workspace={workspace}
          onWorkspaceUpdated={onWorkspaceUpdated}
        />
      </div>

      {/* CENTER: View Mode Segmented Control */}
      <div className="shrink-0">
        <WorkspaceViewToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>

      {/* RIGHT: Presence, Share link & AI Assistant */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Presence indicator (Online members) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="font-mono text-[11px]">1 active</span>
        </div>

        {/* Share Link Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="h-9 px-2.5 sm:px-3 gap-1.5 border-border bg-card text-foreground hover:bg-secondary text-xs sm:text-sm font-semibold"
          title="Share workspace link"
        >
          {copied ? (
            <>
              <Check className="size-4 text-emerald-400" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="size-4 text-muted-foreground" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </Button>

        {/* AI Assistant Toggle Button */}
        <Button
          type="button"
          size="sm"
          onClick={onToggleAiDrawer}
          className={`h-9 px-3 sm:px-3.5 gap-2 text-xs sm:text-sm font-bold transition-all shadow-xs ${
            aiDrawerOpen
              ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20"
              : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
          }`}
        >
          <Sparkles className="size-4 text-cyan-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
      </div>
    </header>
  );
}
