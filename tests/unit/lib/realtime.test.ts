import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  subscribeToKanban,
  subscribeToRoomPresence,
  KanbanMutation,
  RoomUser,
} from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";

type PostgresChangesHandler = (payload: {
  eventType: string;
  new?: unknown;
  old?: unknown;
}) => void;
type PresenceSyncHandler = () => void;
type SubscribeStatusHandler = (status: string) => void;

let registeredPostgresHandler: PostgresChangesHandler | null = null;
let registeredPresenceHandler: PresenceSyncHandler | null = null;
let registeredSubscribeHandler: SubscribeStatusHandler | null = null;

const mockPresenceState = {
  key1: [{ user: { id: "user-1", name: "Alice" } }],
  key2: [{ user: { id: "user-2", name: "Bob" } }],
};

const mockChannel = {
  on: vi.fn(
    (
      type: string,
      filter: { event: string },
      handler: PostgresChangesHandler | PresenceSyncHandler,
    ) => {
      if (type === "postgres_changes") {
        registeredPostgresHandler = handler as PostgresChangesHandler;
      } else if (type === "presence") {
        registeredPresenceHandler = handler as PresenceSyncHandler;
      }
      return mockChannel;
    },
  ),
  subscribe: vi.fn((cb?: SubscribeStatusHandler) => {
    registeredSubscribeHandler = cb || null;
    return mockChannel;
  }),
  track: vi.fn().mockResolvedValue({}),
  presenceState: vi.fn(() => mockPresenceState),
};

vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

describe("Realtime Central Module (src/lib/realtime.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registeredPostgresHandler = null;
    registeredPresenceHandler = null;
    registeredSubscribeHandler = null;
  });

  describe("subscribeToKanban", () => {
    it("should subscribe to kanban-workspaces channel and register postgres_changes", () => {
      const onMutation = vi.fn();
      const unsubscribe = subscribeToKanban(onMutation);

      expect(supabase.channel).toHaveBeenCalledWith("kanban-workspaces");
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(registeredPostgresHandler).toBeDefined();

      unsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it("should transform and forward INSERT mutations", () => {
      const mutations: KanbanMutation[] = [];
      subscribeToKanban((m) => mutations.push(m));

      const mockWs: WorkspaceItem = {
        id: "ws-new",
        name: "Gateway",
        description: null,
        status: WorkspaceStatus.PLANNING,
        position: 1000,
        creatorId: "user-1",
        clerkOrgId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      registeredPostgresHandler!({
        eventType: "INSERT",
        new: mockWs,
      });

      expect(mutations).toHaveLength(1);
      expect(mutations[0]).toEqual({
        type: "INSERT",
        record: mockWs,
      });
    });

    it("should transform and forward UPDATE mutations", () => {
      const mutations: KanbanMutation[] = [];
      subscribeToKanban((m) => mutations.push(m));

      const updatedWs: WorkspaceItem = {
        id: "ws-1",
        name: "Renamed Gateway",
        description: null,
        status: WorkspaceStatus.IN_PROGRESS,
        position: 2000,
        creatorId: "user-1",
        clerkOrgId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      registeredPostgresHandler!({
        eventType: "UPDATE",
        new: updatedWs,
      });

      expect(mutations).toHaveLength(1);
      expect(mutations[0]).toEqual({
        type: "UPDATE",
        record: updatedWs,
      });
    });

    it("should transform and forward DELETE mutations", () => {
      const mutations: KanbanMutation[] = [];
      subscribeToKanban((m) => mutations.push(m));

      registeredPostgresHandler!({
        eventType: "DELETE",
        old: { id: "ws-deleted-id" },
      });

      expect(mutations).toHaveLength(1);
      expect(mutations[0]).toEqual({
        type: "DELETE",
        id: "ws-deleted-id",
      });
    });
  });

  describe("subscribeToRoomPresence", () => {
    it("should subscribe to room presence channel and track user on SUBSCRIBED", async () => {
      const onSync = vi.fn();
      const currentUser: RoomUser = {
        id: "user-me",
        name: "Architect",
        imageUrl: null,
      };

      const unsubscribe = subscribeToRoomPresence("room-123", currentUser, onSync);

      expect(supabase.channel).toHaveBeenCalledWith("room-presence:room-123");
      expect(mockChannel.subscribe).toHaveBeenCalled();

      // Trigger SUBSCRIBED callback
      await registeredSubscribeHandler!("SUBSCRIBED");
      expect(mockChannel.track).toHaveBeenCalledWith({ user: currentUser });

      // Trigger presence sync
      registeredPresenceHandler!();
      expect(onSync).toHaveBeenCalledWith([
        { id: "user-1", name: "Alice" },
        { id: "user-2", name: "Bob" },
      ]);

      unsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });
});
