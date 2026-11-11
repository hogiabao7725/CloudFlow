import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { WorkspaceItem } from "@/types/workspace";

export type KanbanMutation =
  | { type: "INSERT"; record: WorkspaceItem }
  | { type: "UPDATE"; record: WorkspaceItem }
  | { type: "DELETE"; id: string };

/**
 * Subscribes to real-time PostgreSQL mutations on the Workspace table.
 * Used exclusively for synchronizing Kanban board state across team members.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToKanban(
  onMutation: (mutation: KanbanMutation) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel("kanban-workspaces")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Workspace" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          onMutation({
            type: "INSERT",
            record: payload.new as WorkspaceItem,
          });
        } else if (payload.eventType === "UPDATE") {
          onMutation({
            type: "UPDATE",
            record: payload.new as WorkspaceItem,
          });
        } else if (payload.eventType === "DELETE") {
          const oldRecord = payload.old as { id?: string };
          if (oldRecord?.id) {
            onMutation({
              type: "DELETE",
              id: oldRecord.id,
            });
          }
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
