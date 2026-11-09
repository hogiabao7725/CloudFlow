import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { useKanban } from "@/hooks/use-kanban";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";
import {
  updateWorkspaceStatus,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspace";

vi.mock("@/actions/workspace", () => ({
  updateWorkspaceStatus: vi.fn(),
  updateWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to execute hook via React SSR runner without external DOM dependencies
function renderUseKanban(initialWorkspaces: WorkspaceItem[]) {
  let hookOutput!: ReturnType<typeof useKanban>;
  function Consumer() {
    hookOutput = useKanban(initialWorkspaces);
    return null;
  }
  renderToString(React.createElement(Consumer));
  return hookOutput;
}

describe("useKanban Hook", () => {
  const mockWorkspaces: WorkspaceItem[] = [
    {
      id: "ws-1",
      name: "API Gateway",
      description: "Edge proxy and routing",
      status: WorkspaceStatus.PLANNING,
      position: 1000,
      creatorId: "user-1",
      clerkOrgId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "ws-2",
      name: "Database Cluster",
      description: "Postgres primary replica setup",
      status: WorkspaceStatus.IN_PROGRESS,
      position: 2000,
      creatorId: "user-1",
      clerkOrgId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "ws-3",
      name: "Auth Service",
      description: "OAuth2 and Clerk IAM",
      status: WorkspaceStatus.DONE,
      position: 3000,
      creatorId: "user-1",
      clerkOrgId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "ws-4",
      name: "Cache Cluster",
      description: "Distributed Redis cluster",
      status: WorkspaceStatus.PAUSED,
      position: 4000,
      creatorId: "user-1",
      clerkOrgId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with all workspaces and compute accurate metrics", () => {
    const kanban = renderUseKanban(mockWorkspaces);

    expect(kanban.workspaces).toHaveLength(4);
    expect(kanban.allWorkspaces).toHaveLength(4);
    expect(kanban.metrics).toEqual({
      total: 4,
      planning: 1,
      inProgress: 1,
      paused: 1,
      done: 1,
    });
  });

  it("should return zeros for metrics when given empty initial workspaces", () => {
    const kanban = renderUseKanban([]);

    expect(kanban.workspaces).toHaveLength(0);
    expect(kanban.metrics).toEqual({
      total: 0,
      planning: 0,
      inProgress: 0,
      paused: 0,
      done: 0,
    });
  });

  it("should expose filter controls and actions interface", () => {
    const kanban = renderUseKanban(mockWorkspaces);

    expect(kanban.filter.search).toBe("");
    expect(kanban.filter.status).toBe("ALL");
    expect(typeof kanban.filter.setSearch).toBe("function");
    expect(typeof kanban.filter.setStatus).toBe("function");

    expect(typeof kanban.actions.onDragEnd).toBe("function");
    expect(typeof kanban.actions.createWorkspace).toBe("function");
    expect(typeof kanban.actions.renameWorkspace).toBe("function");
    expect(typeof kanban.actions.deleteWorkspace).toBe("function");
  });

  it("should handle rename action and call server update", async () => {
    vi.mocked(updateWorkspace).mockResolvedValue({
      success: true,
      workspace: { ...mockWorkspaces[0], name: "API Gateway V2" },
    } as unknown as Awaited<ReturnType<typeof updateWorkspace>>);

    const kanban = renderUseKanban(mockWorkspaces);
    const success = await kanban.actions.renameWorkspace("ws-1", "API Gateway V2");

    expect(success).toBe(true);
    expect(updateWorkspace).toHaveBeenCalledWith("ws-1", { name: "API Gateway V2" });
  });

  it("should handle delete action and call server delete", async () => {
    vi.mocked(deleteWorkspace).mockResolvedValue({ success: true });

    const kanban = renderUseKanban(mockWorkspaces);
    const success = await kanban.actions.deleteWorkspace("ws-1");

    expect(success).toBe(true);
    expect(deleteWorkspace).toHaveBeenCalledWith("ws-1");
  });

  it("should ignore drag end when dropped outside or at same position", async () => {
    const kanban = renderUseKanban(mockWorkspaces);

    // Dropped outside (no destination)
    await kanban.actions.onDragEnd({
      draggableId: "ws-1",
      source: { droppableId: WorkspaceStatus.PLANNING, index: 0 },
      destination: null,
      combine: null,
      mode: "FLUID",
      reason: "DROP",
      type: "DEFAULT",
    });

    expect(updateWorkspaceStatus).not.toHaveBeenCalled();

    // Dropped at same column and index
    await kanban.actions.onDragEnd({
      draggableId: "ws-1",
      source: { droppableId: WorkspaceStatus.PLANNING, index: 0 },
      destination: { droppableId: WorkspaceStatus.PLANNING, index: 0 },
      combine: null,
      mode: "FLUID",
      reason: "DROP",
      type: "DEFAULT",
    });

    expect(updateWorkspaceStatus).not.toHaveBeenCalled();
  });
});
