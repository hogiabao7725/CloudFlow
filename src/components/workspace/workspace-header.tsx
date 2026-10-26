"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { WorkspaceStatus } from "@prisma/client";
import {
  ArrowLeft,
  Edit2,
  Check,
  X,
  Share2,
  Sparkles,
  Columns2,
  FileText,
  Network,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceItem } from "@/types/workspace";
import { updateWorkspace, updateWorkspaceStatus } from "@/actions/workspace";

export type ViewMode = "doc" | "dual" | "canvas";

interface WorkspaceHeaderProps {
  workspace: WorkspaceItem;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  aiDrawerOpen: boolean;
  onToggleAiDrawer: () => void;
  onWorkspaceUpdated?: (updated: Partial<WorkspaceItem>) => void;
}

const STATUS_CONFIG: Record<
  WorkspaceStatus,
  { label: string; dotColor: string; bg: string }
> = {
  [WorkspaceStatus.PLANNING]: {
    label: "Planning",
    dotColor: "bg-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20 text-slate-300",
  },
  [WorkspaceStatus.IN_PROGRESS]: {
    label: "In Progress",
    dotColor: "bg-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  },
  [WorkspaceStatus.PAUSED]: {
    label: "Paused",
    dotColor: "bg-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  },
  [WorkspaceStatus.DONE]: {
    label: "Done",
    dotColor: "bg-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  },
};

export function WorkspaceHeader({
  workspace,
  viewMode,
  onViewModeChange,
  aiDrawerOpen,
  onToggleAiDrawer,
  onWorkspaceUpdated,
}: WorkspaceHeaderProps) {
  // Inline rename state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Status selector state
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WorkspaceStatus>(
    workspace.status,
  );

  // Share link state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === workspace.name) {
      setName(workspace.name);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateWorkspace(workspace.id, { name: trimmed });
      if (!res.success) {
        toast.error(res.error || "Failed to update title");
        setName(workspace.name);
      } else {
        toast.success("Workspace renamed");
        onWorkspaceUpdated?.({ name: trimmed });
      }
    } catch {
      toast.error("Failed to update title");
      setName(workspace.name);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setName(workspace.name);
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (newStatus: WorkspaceStatus) => {
    setStatusMenuOpen(false);
    if (newStatus === currentStatus) return;

    const prev = currentStatus;
    setCurrentStatus(newStatus);

    try {
      const res = await updateWorkspaceStatus(
        workspace.id,
        newStatus,
        workspace.position,
      );
      if (!res.success) {
        toast.error("Failed to update status");
        setCurrentStatus(prev);
      } else {
        toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
        onWorkspaceUpdated?.({ status: newStatus });
      }
    } catch {
      toast.error("Failed to update status");
      setCurrentStatus(prev);
    }
  };

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

  const statusInfo =
    STATUS_CONFIG[currentStatus] || STATUS_CONFIG[WorkspaceStatus.PLANNING];

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/90 px-3 sm:px-5 h-14 shrink-0 select-none z-30">
      {/* =========================================================================
          LEFT: Back button, Inline Editable Title & Status Dropdown
         ========================================================================= */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Link href="/dashboard" title="Back to Dashboard">
            <ArrowLeft className="size-4.5 mr-1.5" />
            <span className="hidden sm:inline font-medium text-sm">
              Dashboard
            </span>
          </Link>
        </Button>

        <span className="h-5 w-px bg-border/80 shrink-0" />

        {/* Inline Editable Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveName}
                disabled={isSaving}
                maxLength={100}
                className="h-8 w-56 sm:w-72 bg-background border-border text-foreground text-sm font-bold px-2.5"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSaving}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <Check className="size-4 text-emerald-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(workspace.name);
                  setIsEditing(false);
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-1.5 text-left min-w-0 py-1 px-2 rounded-lg hover:bg-secondary/60 transition-colors"
              title="Click to rename workspace"
            >
              <span className="text-sm sm:text-base font-bold text-foreground truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
                {name}
              </span>
              <Edit2 className="size-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0" />
            </button>
          )}
        </div>

        {/* Interactive Status Selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${statusInfo.bg}`}
          >
            <span className={`size-2 rounded-full ${statusInfo.dotColor}`} />
            <span>{statusInfo.label}</span>
            <ChevronDown className="size-3.5 opacity-60" />
          </button>

          {statusMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setStatusMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/40 text-xs sm:text-sm">
                {(Object.keys(STATUS_CONFIG) as WorkspaceStatus[]).map((st) => {
                  const cfg = STATUS_CONFIG[st];
                  const isCurrent = st === currentStatus;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                        isCurrent
                          ? "bg-secondary text-foreground font-bold"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${cfg.dotColor}`}
                        />
                        <span>{cfg.label}</span>
                      </div>
                      {isCurrent && (
                        <Check className="size-3.5 text-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          CENTER: View Mode Toggle Segmented Control (Task 4.2 Requirement)
         ========================================================================= */}
      <div className="hidden md:flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => onViewModeChange("doc")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            viewMode === "doc"
              ? "bg-secondary text-foreground shadow-sm shadow-black/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Document only mode"
        >
          <FileText className="size-4" />
          <span>Doc only</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("dual")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            viewMode === "dual"
              ? "bg-secondary text-foreground shadow-sm shadow-black/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Split dual-view mode"
        >
          <Columns2 className="size-4" />
          <span>Dual View</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("canvas")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            viewMode === "canvas"
              ? "bg-secondary text-foreground shadow-sm shadow-black/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Canvas only mode"
        >
          <Network className="size-4" />
          <span>Canvas only</span>
        </button>
      </div>

      {/* =========================================================================
          RIGHT: Share link, Presence indicator, AI Assistant Toggle
         ========================================================================= */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Presence indicator (Online members) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="font-mono">1 active</span>
        </div>

        {/* Share Link Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="h-9 px-3 gap-1.5 border-border bg-card text-foreground hover:bg-secondary text-xs sm:text-sm font-semibold"
          title="Share workspace link"
        >
          {copied ? (
            <>
              <Check className="size-4 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Share2 className="size-4 text-muted-foreground" />
              <span>Share</span>
            </>
          )}
        </Button>

        {/* AI Assistant Toggle Button (Ready for Phase 6) */}
        <Button
          type="button"
          size="sm"
          onClick={onToggleAiDrawer}
          className={`h-9 px-3.5 gap-2 text-xs sm:text-sm font-bold transition-all shadow-sm ${
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
