import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { WorkspaceItem } from "@/types/workspace";

export type KanbanMutation =
  | { type: "INSERT"; record: WorkspaceItem }
  | { type: "UPDATE"; record: WorkspaceItem }
  | { type: "DELETE"; id: string };

export interface RoomUser {
  id: string;
  name: string;
  imageUrl?: string | null;
}

/**
 * Subscribes to real-time PostgreSQL mutations on the Workspace table.
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

/**
 * Subscribes to live room presence to track active participants.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToRoomPresence(
  roomId: string,
  currentUser: RoomUser,
  onSync: (users: RoomUser[]) => void,
): () => void {
  const channel: RealtimeChannel = supabase.channel(`room-presence:${roomId}`);

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ user: RoomUser }>();
      const activeUsers: RoomUser[] = [];

      for (const presenceKey of Object.keys(state)) {
        const presences = state[presenceKey] || [];
        for (const presence of presences) {
          if (presence?.user) {
            activeUsers.push(presence.user);
          }
        }
      }

      onSync(activeUsers);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user: currentUser });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
