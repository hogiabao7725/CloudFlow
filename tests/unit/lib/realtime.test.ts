import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscribeToKanban, KanbanMutation } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";

type PostgresChangesHandler = (payload: {
  eventType: string;
  new?: unknown;
  old?: unknown;
}) => void;

let registeredPostgresHandler: PostgresChangesHandler | null = null;

const mockChannel = {
  on: vi.fn(
    (
      type: string,
      _filter: { event: string },
      handler: PostgresChangesHandler,
    ) => {
      if (type === "postgres_changes") {
        registeredPostgresHandler = handler;
      }
      return mockChannel;
    },
  ),
  subscribe: vi.fn(() => mockChannel),
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
});
