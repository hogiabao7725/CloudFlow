import { supabase } from "@/lib/supabase";
import type { WorkspaceItem } from "@/types/workspace";

export type KanbanMutation =
  | { type: "INSERT"; record: WorkspaceItem }
  | { type: "UPDATE"; record: WorkspaceItem }
  | { type: "DELETE"; id: string };

/**
 * Subscribes to real-time PostgreSQL mutations on the Workspace table.
 */
export function subscribeToKanban(
  onMutation: (mutation: KanbanMutation) => void,
): () => void {
  const channel = supabase
    .channel("kanban-workspaces")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Workspace" },
      ({ eventType, new: newRec, old: oldRec }) => {
        if (eventType === "INSERT" || eventType === "UPDATE") {
          onMutation({ type: eventType, record: newRec as WorkspaceItem });
        } else if (eventType === "DELETE" && (oldRec as { id?: string })?.id) {
          onMutation({ type: "DELETE", id: (oldRec as { id: string }).id });
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
