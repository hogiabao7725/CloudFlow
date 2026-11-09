import { useState } from "react";
import { WorkspaceItem } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RenameFormProps {
  target: WorkspaceItem;
  onClose: () => void;
  onConfirm: (id: string, newName: string) => Promise<boolean>;
}

/**
 * Inner rename form keyed by target ID to avoid cascading setState in effects.
 */
function RenameDialogContent({ target, onClose, onConfirm }: RenameFormProps) {
  const [name, setName] = useState(target.name);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    const success = await onConfirm(target.id, name);
    setIsPending(false);

    if (success) {
      onClose();
    }
  };

  return (
    <DialogContent className="sm:max-w-md bg-card border-border">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Rename workspace
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter a new name for this architecture workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            onClick={onClose}
            className="border-border bg-card/80 text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="font-semibold"
          >
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface KanbanDialogsProps {
  renameTarget: WorkspaceItem | null;
  deleteTarget: WorkspaceItem | null;
  onCloseRename: () => void;
  onCloseDelete: () => void;
  onConfirmRename: (id: string, newName: string) => Promise<boolean>;
  onConfirmDelete: (id: string) => Promise<boolean>;
}

/**
 * Shared Rename and Delete confirmation dialogs for the Kanban board.
 */
export function KanbanDialogs({
  renameTarget,
  deleteTarget,
  onCloseRename,
  onCloseDelete,
  onConfirmRename,
  onConfirmDelete,
}: KanbanDialogsProps) {
  const [isDeletePending, setIsDeletePending] = useState(false);

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    setIsDeletePending(true);
    const success = await onConfirmDelete(deleteTarget.id);
    setIsDeletePending(false);

    if (success) {
      onCloseDelete();
    }
  };

  return (
    <>
      {/* Rename Dialog */}
      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && onCloseRename()}>
        {renameTarget && (
          <RenameDialogContent
            key={renameTarget.id}
            target={renameTarget}
            onClose={onCloseRename}
            onConfirm={onConfirmRename}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && onCloseDelete()}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">
              Delete workspace?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
              This action cannot be undone. All synchronized diagrams, canvas nodes, and markdown
              technical specifications will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isDeletePending}
              onClick={onCloseDelete}
              className="border-border bg-card/80 text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletePending}
              onClick={handleDeleteSubmit}
              className="font-semibold"
            >
              {isDeletePending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
