import { supabase } from "@/lib/supabase";
import type { WorkspaceItem } from "@/types/workspace";

export type KanbanMutation =
  | { type: "INSERT"; record: WorkspaceItem }
  | { type: "UPDATE"; record: WorkspaceItem }
  | { type: "DELETE"; id: string };

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string | null;
  color?: string;
}

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

/**
 * Subscribes to real-time presence for a specific workspace.
 */
export function subscribeToWorkspacePresence(
  workspaceId: string,
  currentUser: PresenceUser,
  onSync: (users: PresenceUser[]) => void,
): () => void {
  const channel = supabase.channel(`presence:workspace:${workspaceId}`);

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser>();
      const users: PresenceUser[] = [];
      const seen = new Set<string>();

      for (const key of Object.keys(state)) {
        for (const presence of state[key]) {
          if (presence.id && !seen.has(presence.id)) {
            seen.add(presence.id);
            users.push(presence);
          }
        }
      }

      onSync(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(currentUser);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to real-time changes on the Doc table for a specific workspace.
 */
export function subscribeToDoc(
  workspaceId: string,
  onUpdate: (markdown: string) => void,
): () => void {
  const channel = supabase
    .channel(`doc:${workspaceId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Doc",
        filter: `workspaceId=eq.${workspaceId}`,
      },
      (payload) => {
        const newRecord = payload.new as { markdown?: string | null } | undefined;
        if (newRecord && typeof newRecord.markdown === "string") {
          onUpdate(newRecord.markdown);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
