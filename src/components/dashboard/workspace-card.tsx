"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Draggable } from "@hello-pangea/dnd";
import { MoreVertical, Trash2, Edit2, Network, FileText, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceItem } from "@/types/workspace";
import { updateWorkspace, deleteWorkspace } from "@/actions/workspace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  index: number;
  onDeleted?: (id: string) => void;
  onUpdated?: (workspace: WorkspaceItem) => void;
}

export function WorkspaceCard({
  workspace,
  index,
  onDeleted,
  onUpdated,
}: WorkspaceCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(workspace.name);
  const [isPending, setIsPending] = useState(false);

  const creatorName = workspace.creator?.name || workspace.creator?.email?.split("@")[0] || "Architect";
  const avatarLetter = (workspace.creator?.name?.[0] || workspace.creator?.email?.[0] || "A").toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true });

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

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsPending(true);
    try {
      const res = await updateWorkspace(workspace.id, { name: newName.trim() });
      if (!res.success || !res.workspace) {
        toast.error(res.error || "Failed to rename workspace");
        return;
      }
      toast.success("Workspace renamed");
      setRenameOpen(false);
      onUpdated?.({ ...workspace, name: newName.trim() });
    } catch {
      toast.error("Failed to rename workspace");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const res = await deleteWorkspace(workspace.id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete workspace");
        return;
      }
      toast.success("Workspace deleted");
      setDeleteOpen(false);
      onDeleted?.(workspace.id);
    } catch {
      toast.error("Failed to delete workspace");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Draggable draggableId={workspace.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleCardClick}
            className={`group relative flex flex-col justify-between h-[200px] min-h-[200px] max-h-[200px] w-full shrink-0 rounded-2xl border p-5 transition-all duration-200 select-none cursor-pointer ${
              snapshot.isDragging
                ? "border-foreground/80 bg-card shadow-2xl shadow-black/70 scale-[1.03] z-50 ring-2 ring-foreground/20"
                : "border-border/80 bg-card hover:border-foreground/40 hover:bg-card hover:shadow-lg hover:shadow-black/20"
            }`}
          >
            {/* 1. Header: Title & Action Menu (Strictly Fixed Dimensions) */}
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
                            setRenameOpen(true);
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
                            setDeleteOpen(true);
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

              {/* Description Slot: Strictly 40px, exactly 2 lines clamped, identical across all cards */}
              <div className="h-[40px] mt-2 overflow-hidden shrink-0">
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

            {/* 2. Middle: Standardized Artifact Tags (Fixed 24px Height) */}
            <div className="flex items-center gap-2 h-6 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                <Network className="size-3.5" />
                <span>Canvas</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-300">
                <FileText className="size-3.5" />
                <span>Doc</span>
              </span>
            </div>

            {/* 3. Footer: Creator & Timestamp (Strictly Fixed 36px Height, Pinned to bottom) */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3 h-9 shrink-0 text-xs text-muted-foreground gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {workspace.creator?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workspace.creator.imageUrl}
                    alt={creatorName}
                    className="size-5 rounded-full object-cover shrink-0 ring-1 ring-border"
                  />
                ) : (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                    {avatarLetter}
                  </span>
                )}
                <span className="truncate font-medium text-foreground/90 text-xs">
                  {creatorName}
                </span>
              </div>
              <span className="text-muted-foreground/80 shrink-0 text-[11px] whitespace-nowrap">
                {timeAgo}
              </span>
            </div>
          </div>
        )}
      </Draggable>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Rename workspace</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter a new name for this architecture workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
                disabled={isPending}
                className="h-11 bg-background border-border text-foreground text-sm"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setRenameOpen(false)}
                className="border-border bg-card/80 text-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !newName.trim()} className="font-semibold">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Delete workspace?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
              This action cannot be undone. All synchronized diagrams, canvas nodes, and markdown technical specifications will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
              className="border-border bg-card/80 text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="font-semibold"
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
