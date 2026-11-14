"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Draggable } from "@hello-pangea/dnd";
import {
  MoreVertical,
  Trash2,
  Edit2,
  ArrowUpRight,
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
} from "lucide-react";
import { WorkspaceItem } from "@/types/workspace";

function formatCompactRelativeTime(dateInput: Date | string): string {
  const diffSec = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000);
  if (isNaN(diffSec) || diffSec < 0) return "recently";
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMo = Math.floor(diffDays / 30);
  return diffMo < 12 ? `${diffMo}mo ago` : `${Math.floor(diffDays / 365)}y ago`;
}

export interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  index: number;
  onRename?: (workspace: WorkspaceItem) => void;
  onDelete?: (workspace: WorkspaceItem) => void;
}

/**
 * Clean 3-tier Kanban Workspace Card (Linear / Raycast minimalist style).
 * - Tier 1: Title + Context Menu (visible on hover)
 * - Tier 2: 1-line concise description (rendered only when present)
 * - Tier 3: Unified Footer (Git PR info on left, Avatar & relative time on right)
 */
export function WorkspaceCard({
  workspace,
  index,
  onRename,
  onDelete,
}: WorkspaceCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const creatorName =
    workspace.creator?.name ||
    workspace.creator?.email?.split("@")[0] ||
    "Architect";
  const avatarLetter = (
    workspace.creator?.name?.[0] ||
    workspace.creator?.email?.[0] ||
    "A"
  ).toUpperCase();

  const fullUpdatedDate = format(new Date(workspace.updatedAt), "dd/MM/yyyy HH:mm");
  const relativeUpdated = formatCompactRelativeTime(workspace.updatedAt);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking inside the actions dropdown menu
    if ((e.target as HTMLElement).closest('[data-prevent-card-click="true"]')) {
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      window.open(`/workspaces/${workspace.id}`, "_blank");
      return;
    }
    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <Draggable draggableId={workspace.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`group relative flex flex-col justify-between rounded-lg border p-5 min-h-[148px] transition-all duration-150 select-none cursor-pointer ${
            snapshot.isDragging
              ? "border-white/80 bg-card shadow-2xl shadow-black/80 scale-[1.02] z-50 ring-1 ring-white/30"
              : "border-white/10 bg-card hover:border-white/30 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5"
          }`}
        >
          {/* TẦNG 1 & 2: Header (Title + Actions) & Description */}
          <div className="w-full">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div
                title={workspace.name}
                className="flex items-center gap-1.5 min-w-0 flex-1 group/title"
              >
                <span className="truncate text-[15px] font-semibold text-zinc-100 tracking-tight leading-snug group-hover:text-white transition-colors">
                  {workspace.name}
                </span>
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 text-zinc-400 shrink-0" />
              </div>

              {/* Context menu trigger - visible on group hover or when menu is open */}
              <div className="relative shrink-0" data-prevent-card-click="true">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  aria-label="Workspace actions"
                  className={`rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-all ${
                    menuOpen ? "opacity-100 bg-white/10 text-white" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <MoreVertical className="size-4" />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    />
                    <div
                      className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-white/10 bg-card p-1 shadow-2xl shadow-black/60 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onRename?.(workspace);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-white hover:bg-white/10 text-left font-medium"
                      >
                        <Edit2 className="size-3.5 text-zinc-400" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete?.(workspace);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 text-left font-medium"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description: 2-line clamp with relaxed leading, or fallback placeholder for visual consistency */}
            {workspace.description ? (
              <p
                className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed mt-2.5"
                title={workspace.description}
              >
                {workspace.description}
              </p>
            ) : (
              <p className="text-[13px] text-zinc-600/70 italic line-clamp-1 leading-relaxed mt-2.5 select-none">
                No description provided
              </p>
            )}
          </div>

          {/* TẦNG 3: Footer tinh gọn (Git PR / status bên trái, User + Time bên phải) */}
          <div className="flex items-center justify-between gap-2 mt-5 pt-0 min-w-0">
            {/* Git PR Info hoặc Symmetrical Placeholder khi chưa có PR */}
            {workspace.githubPr ? (
              <div
                className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden"
                title={`PR #${workspace.githubPr.number}: ${workspace.githubPr.title} (${workspace.githubPr.branch})`}
              >
                {workspace.githubPr.state === "merged" ? (
                  <GitMerge className="size-4 text-purple-400 shrink-0" />
                ) : workspace.githubPr.state === "closed" ? (
                  <GitPullRequestClosed className="size-4 text-zinc-400 shrink-0" />
                ) : (
                  <GitPullRequest className="size-4 text-emerald-400 shrink-0" />
                )}
                <span className="text-xs font-mono font-semibold text-zinc-200 shrink-0">
                  #{workspace.githubPr.number}
                </span>
                <span className="text-xs font-mono text-zinc-400 truncate max-w-32">
                  {workspace.githubPr.branch}
                </span>
                {workspace.githubPr.ciStatus === "passed" && (
                  <span className="size-2 rounded-full bg-emerald-400 shrink-0" title="CI Passed" />
                )}
                {workspace.githubPr.ciStatus === "failed" && (
                  <span className="size-2 rounded-full bg-rose-400 shrink-0" title="CI Failed" />
                )}
                {workspace.githubPr.ciStatus === "running" && (
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse shrink-0" title="CI Running" />
                )}
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 min-w-0 flex-1 text-zinc-500 overflow-hidden"
                title="No GitHub PR linked to this workspace"
              >
                <GitPullRequest className="size-4 text-zinc-600 shrink-0" />
                <span className="text-xs font-mono tracking-tight text-zinc-500 truncate">
                  No PR linked
                </span>
              </div>
            )}

            {/* Avatar & thời gian cập nhật */}
            <div className="flex items-center gap-1.5 shrink-0">
              {workspace.creator?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workspace.creator.imageUrl}
                  alt={creatorName}
                  className="size-5 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                  title={`Creator: ${creatorName}`}
                />
              ) : (
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-zinc-300"
                  title={`Creator: ${creatorName}`}
                >
                  {avatarLetter}
                </span>
              )}
              <span
                suppressHydrationWarning
                className="text-xs font-medium text-zinc-400 tabular-nums shrink-0"
                title={`Last updated at ${fullUpdatedDate}`}
              >
                {relativeUpdated}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
