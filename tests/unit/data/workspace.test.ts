import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  findWorkspaceById,
  findWorkspaces,
  getHighestPosition,
  insertWorkspace,
  updateWorkspaceData,
  updateWorkspaceGitHubPr,
  deleteWorkspaceById,
} from "@/data/workspace";
import { prisma } from "@/lib/prisma";
import { WorkspaceStatus } from "@prisma/client";
import type { GitHubPrInfo } from "@/types/workspace";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Workspace Data Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findWorkspaceById", () => {
    it("should query workspace by id including creator and doc", async () => {
      const mockResult = { id: "ws_1", name: "Architecture A" };
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue(mockResult as never);

      const result = await findWorkspaceById("ws_1");
      expect(result).toEqual(mockResult);
      expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: "ws_1" },
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          doc: true,
        },
      });
    });
  });

  describe("findWorkspaces", () => {
    it("should query personal workspaces when orgId is null", async () => {
      const mockList = [{ id: "ws_1", name: "Personal WS" }];
      vi.mocked(prisma.workspace.findMany).mockResolvedValue(mockList as never);

      const result = await findWorkspaces({ userId: "user_123", orgId: null });
      expect(result).toEqual(mockList);
      expect(prisma.workspace.findMany).toHaveBeenCalledWith({
        where: { creatorId: "user_123", clerkOrgId: null },
        orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      });
    });

    it("should query organization workspaces when orgId is provided", async () => {
      const mockList = [{ id: "ws_2", name: "Org WS" }];
      vi.mocked(prisma.workspace.findMany).mockResolvedValue(mockList as never);

      const result = await findWorkspaces({ orgId: "org_alpha" });
      expect(result).toEqual(mockList);
      expect(prisma.workspace.findMany).toHaveBeenCalledWith({
        where: { clerkOrgId: "org_alpha" },
        orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      });
    });
  });

  describe("getHighestPosition", () => {
    it("should return the highest position in a given status column", async () => {
      vi.mocked(prisma.workspace.aggregate).mockResolvedValue({
        _max: { position: 2500 },
      } as never);

      const result = await getHighestPosition(WorkspaceStatus.PLANNING, {
        userId: "user_123",
      });
      expect(result).toBe(2500);
      expect(prisma.workspace.aggregate).toHaveBeenCalledWith({
        where: { creatorId: "user_123", clerkOrgId: null, status: WorkspaceStatus.PLANNING },
        _max: { position: true },
      });
    });

    it("should return 0 when no workspaces exist in the column", async () => {
      vi.mocked(prisma.workspace.aggregate).mockResolvedValue({
        _max: { position: null },
      } as never);

      const result = await getHighestPosition(WorkspaceStatus.PLANNING, {
        orgId: "org_empty",
      });
      expect(result).toBe(0);
    });
  });

  describe("insertWorkspace", () => {
    it("should create workspace record with initialized doc", async () => {
      const mockCreated = { id: "ws_new", name: "New Design" };
      vi.mocked(prisma.workspace.create).mockResolvedValue(mockCreated as never);

      const result = await insertWorkspace({
        name: "New Design",
        creatorId: "user_123",
        position: 1000,
      });

      expect(result).toEqual(mockCreated);
      expect(prisma.workspace.create).toHaveBeenCalledWith({
        data: {
          name: "New Design",
          description: null,
          creatorId: "user_123",
          clerkOrgId: null,
          status: WorkspaceStatus.PLANNING,
          position: 1000,
          doc: { create: { markdown: "" } },
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          doc: true,
        },
      });
    });
  });

  describe("updateWorkspaceData", () => {
    it("should update workspace fields", async () => {
      const mockUpdated = { id: "ws_1", name: "Updated Title" };
      vi.mocked(prisma.workspace.update).mockResolvedValue(mockUpdated as never);

      const result = await updateWorkspaceData("ws_1", { name: "Updated Title" });
      expect(result).toEqual(mockUpdated);
      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: "ws_1" },
        data: { name: "Updated Title" },
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      });
    });
  });

  describe("updateWorkspaceGitHubPr", () => {
    it("should update linked githubPr on workspace", async () => {
      const prInfo: GitHubPrInfo = {
        url: "https://github.com/hogiabao7725/CloudFlow/pull/3",
        number: 3,
        title: "feat: RFC specs",
        state: "closed",
        merged: true,
        branch: "feat/room-rfc",
        ciStatus: "passed",
      };

      const mockUpdated = { id: "ws_1", githubPr: prInfo };
      vi.mocked(prisma.workspace.update).mockResolvedValue(mockUpdated as never);

      const result = await updateWorkspaceGitHubPr("ws_1", prInfo);
      expect(result).toEqual(mockUpdated);
      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: "ws_1" },
        data: { githubPr: prInfo },
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      });
    });
  });

  describe("deleteWorkspaceById", () => {
    it("should delete workspace record by id", async () => {
      const mockDeleted = { id: "ws_delete_me" };
      vi.mocked(prisma.workspace.delete).mockResolvedValue(mockDeleted as never);

      const result = await deleteWorkspaceById("ws_delete_me");
      expect(result).toEqual(mockDeleted);
      expect(prisma.workspace.delete).toHaveBeenCalledWith({
        where: { id: "ws_delete_me" },
      });
    });
  });
});
