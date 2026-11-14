import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  subscribeToKanban,
  subscribeToWorkspacePresence,
  KanbanMutation,
  PresenceUser,
} from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";

type PostgresChangesHandler = (payload: {
  eventType: string;
  new?: unknown;
  old?: unknown;
}) => void;

let registeredPostgresHandler: PostgresChangesHandler | null = null;
let registeredPresenceHandler: (() => void) | null = null;
let mockPresenceState: Record<string, PresenceUser[]> = {};

const mockChannel = {
  on: vi.fn(
    (
      type: string,
      filter: { event: string },
      handler: any,
    ) => {
      if (type === "postgres_changes") {
        registeredPostgresHandler = handler;
      } else if (type === "presence" && filter?.event === "sync") {
        registeredPresenceHandler = handler;
      }
      return mockChannel;
    },
  ),
  subscribe: vi.fn((callback?: (status: string) => void) => {
    if (callback) {
      callback("SUBSCRIBED");
    }
    return mockChannel;
  }),
  track: vi.fn(async () => {}),
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
    mockPresenceState = {};
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
        name: "Updated Gateway",
        description: "New desc",
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

  describe("subscribeToWorkspacePresence", () => {
    it("should subscribe to presence channel and track current user upon SUBSCRIBED", () => {
      const onSync = vi.fn();
      const currentUser: PresenceUser = { id: "user-1", name: "Bao Ho", color: "#22C55E" };
      const unsubscribe = subscribeToWorkspacePresence("ws-123", currentUser, onSync);

      expect(supabase.channel).toHaveBeenCalledWith("presence:workspace:ws-123");
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(mockChannel.track).toHaveBeenCalledWith(currentUser);

      unsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it("should deduplicate users across keys on presence sync event", () => {
      const onSync = vi.fn();
      const currentUser: PresenceUser = { id: "user-1", name: "Bao Ho" };
      subscribeToWorkspacePresence("ws-123", currentUser, onSync);

      mockPresenceState = {
        key1: [
          { id: "user-1", name: "Bao Ho" },
          { id: "user-2", name: "Alex" },
        ],
        key2: [
          { id: "user-1", name: "Bao Ho" },
          { id: "user-3", name: "Sarah" },
        ],
      };

      registeredPresenceHandler!();

      expect(onSync).toHaveBeenCalledWith([
        { id: "user-1", name: "Bao Ho" },
        { id: "user-2", name: "Alex" },
        { id: "user-3", name: "Sarah" },
      ]);
    });
  });
});
