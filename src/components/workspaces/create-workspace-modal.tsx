"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Workflow,
  Layers,
  Network,
  FileText,
  ArrowUpRight,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/actions/workspace";
import { WorkspaceItem } from "@/types/workspace";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspace: WorkspaceItem) => void;
  clerkOrgId?: string | null;
}

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreated,
  clerkOrgId,
}: CreateWorkspaceModalProps) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);

  const creatorName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Architect";
  const avatarLetter = (creatorName[0] || "A").toUpperCase();

  const resetState = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a workspace title");
      return;
    }

    setIsPending(true);
    try {
      const result = await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
        clerkOrgId: clerkOrgId || undefined,
      });

      if (!result.success || !result.workspace) {
        toast.error(result.error || "Failed to create workspace");
        return;
      }

      toast.success("Workspace created");
      onCreated?.(result.workspace);
      resetState();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create workspace");
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (name.trim() && !isPending) {
        handleSubmit(e);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[560px] bg-card border-border p-6 sm:p-7 shadow-2xl shadow-black/70">
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              New Initiative
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Workflow className="size-5 text-primary" />
            <span>Create new workspace</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new architecture workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6 pt-3">
          {/* Section 1: Form Inputs */}
          <div className="space-y-4">
            {/* Workspace Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ws-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Workspace Name <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] font-mono text-muted-foreground/80">{name.length}/100</span>
              </div>
              <Input
                id="ws-name"
                placeholder="e.g. Distributed Auth & Token Broker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                maxLength={100}
                autoFocus
                className="h-11 rounded-xl bg-background/80 border-border text-foreground text-sm font-medium focus-visible:ring-1 focus-visible:ring-foreground transition-all"
              />
            </div>

            {/* Scope & Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ws-desc" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Scope & Description <span className="text-[11px] font-normal text-muted-foreground/80">(Optional)</span>
                </Label>
                <span className="text-[11px] font-mono text-muted-foreground/80">{description.length}/500</span>
              </div>
              <Textarea
                id="ws-desc"
                placeholder="Outline system boundaries, throughput targets, microservices, or cloud constraints..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={2}
                maxLength={500}
                className="rounded-xl bg-background/80 border-border text-foreground text-sm resize-none focus-visible:ring-1 focus-visible:ring-foreground leading-relaxed transition-all"
              />
            </div>
          </div>

          {/* Section 2: Live Ticket Preview (Direct cleanly styled Card, no nested box clutter) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 px-1">
              <Layers className="size-3.5 text-muted-foreground" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Live Ticket Preview
              </span>
            </div>

            {/* Replicating the exact Kanban Card structure */}
            <div className="rounded-2xl border border-border/80 bg-background/70 p-5 space-y-3 shadow-inner">
              {/* Card Title */}
              <div className="flex items-center justify-between gap-2 h-7 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="truncate text-base font-bold text-foreground tracking-tight"
                    title={name || "Untitled Workspace"}
                  >
                    {name.trim() || "Untitled Workspace"}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground shrink-0 opacity-60" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0">#concept</span>
              </div>

              {/* Card Description */}
              <div className="h-[40px] overflow-hidden">
                {description.trim() ? (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-5">
                    {description.trim()}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/40 italic flex items-center h-full">
                    No description provided
                  </p>
                )}
              </div>

              {/* Card Tags */}
              <div className="flex items-center gap-2 h-6">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                  <Network className="size-3.5" />
                  <span>Canvas</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-300">
                  <FileText className="size-3.5" />
                  <span>Doc</span>
                </span>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3 h-9 text-xs text-muted-foreground gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
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
                  Just now
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Modal Actions */}
          <DialogFooter className="border-t border-border/60 pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-muted-foreground/60 hidden sm:inline-flex items-center gap-1">
              <span>Tip: Press</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border text-foreground">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border text-foreground">Enter</kbd>
              <span>to submit</span>
            </span>

            <div className="flex items-center gap-2.5 justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 border-border bg-card hover:bg-secondary text-foreground text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim()}
                className="h-10 px-5 gap-2 font-bold shadow-lg shadow-black/25 text-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    <span>Create Workspace</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
