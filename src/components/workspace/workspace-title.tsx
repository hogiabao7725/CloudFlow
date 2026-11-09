"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { updateWorkspace } from "@/actions/workspace";
import { WorkspaceItem } from "@/types/workspace";

interface WorkspaceTitleProps {
  workspace: WorkspaceItem;
  onWorkspaceUpdated?: (updated: Partial<WorkspaceItem>) => void;
}

/**
 * Inline editable workspace title with keyboard shortcuts and optimistic sync.
 */
export function WorkspaceTitle({
  workspace,
  onWorkspaceUpdated,
}: WorkspaceTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    setName(workspace.name);
    setIsEditing(true);
  };

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

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveName}
          disabled={isSaving}
          maxLength={100}
          className="h-8 w-44 sm:w-64 md:w-72 bg-background border-border text-foreground text-sm font-bold px-2.5"
        />
        <button
          type="button"
          onClick={handleSaveName}
          disabled={isSaving}
          className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
          title="Save (Enter)"
        >
          <Check className="size-4 text-emerald-400" />
        </button>
        <button
          type="button"
          onClick={() => {
            setName(workspace.name);
            setIsEditing(false);
          }}
          className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
          title="Cancel (Esc)"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEditing}
      className="group flex items-center gap-1.5 text-left min-w-0 py-1 px-2 rounded-lg hover:bg-secondary/60 transition-colors"
      title="Click to rename workspace"
    >
      <span className="text-sm sm:text-base font-bold text-foreground truncate max-w-32 sm:max-w-48 md:max-w-72 lg:max-w-xs">
        {workspace.name}
      </span>
      <Edit2 className="size-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0" />
    </button>
  );
}
