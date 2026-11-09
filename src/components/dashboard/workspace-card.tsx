"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Draggable } from "@hello-pangea/dnd";
import {
  MoreVertical,
  Trash2,
  Edit2,
  Network,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { WorkspaceItem } from "@/types/workspace";

export interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  index: number;
  onRename?: (workspace: WorkspaceItem) => void;
  onDelete?: (workspace: WorkspaceItem) => void;
}

/**
 * Visual card item representing an architecture workspace inside a Kanban column.
 * Pure presentational component that delegates mutation triggers to the parent.
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

  const createdDate = format(new Date(workspace.createdAt), "dd/MM/yyyy HH:mm");
  const updatedDate = format(new Date(workspace.updatedAt), "dd/MM/yyyy HH:mm");

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
          className={`group relative flex flex-col justify-between h-50 min-h-50 max-h-50 w-full shrink-0 rounded-2xl border p-5 transition-all duration-200 select-none cursor-pointer ${
            snapshot.isDragging
              ? "border-foreground/80 bg-card shadow-2xl shadow-black/70 scale-[1.03] z-50 ring-2 ring-foreground/20"
              : "border-border/80 bg-card hover:border-foreground/40 hover:bg-card hover:shadow-lg hover:shadow-black/20"
          }`}
        >
          {/* Header: Title and Action Menu */}
          <div className="w-full shrink-0">
            <div className="flex items-center justify-between gap-2 min-w-0 h-7">
              <div
                title={workspace.name}
                className="flex items-center gap-1.5 min-w-0 flex-1 group/title"
              >
                <span className="truncate text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {workspace.name}
                </span>
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground shrink-0" />
              </div>

              {/* Context menu trigger */}
              <div className="relative shrink-0" data-prevent-card-click="true">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  aria-label="Workspace actions"
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
                      className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-border bg-card p-1 shadow-lg shadow-black/30 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onRename?.(workspace);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-foreground hover:bg-secondary text-left font-medium"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete?.(workspace);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-destructive hover:bg-destructive/10 text-left font-medium"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Slot: Fixed height with 2-line clamp */}
            <div className="h-10 mt-2 overflow-hidden shrink-0">
              {workspace.description ? (
                <p
                  className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-5"
                  title={workspace.description}
                >
                  {workspace.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/40 italic flex items-center h-full">
                  No description provided
                </p>
              )}
            </div>
          </div>

          {/* Middle: Artifact Tags & Created Date */}
          <div className="flex items-center justify-between h-6 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">
                <Network className="size-3.5" />
                <span>Canvas</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300">
                <FileText className="size-3.5" />
                <span>Doc</span>
              </span>
            </div>

            <span
              className="text-xs text-muted-foreground/75 tabular-nums shrink-0"
              title={`Created at ${createdDate}`}
            >
              Created: {createdDate}
            </span>
          </div>

          {/* Footer: Creator & Updated Date */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 shrink-0 gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {workspace.creator?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workspace.creator.imageUrl}
                  alt={creatorName}
                  className="size-5.5 rounded-full object-cover shrink-0 ring-1 ring-border"
                />
              ) : (
                <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                  {avatarLetter}
                </span>
              )}
              <span className="truncate font-medium text-foreground/90 text-xs">
                {creatorName}
              </span>
            </div>

            <span
              className="text-xs font-medium text-foreground/80 tabular-nums shrink-0"
              title={`Last updated at ${updatedDate}`}
            >
              Updated: {updatedDate}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
