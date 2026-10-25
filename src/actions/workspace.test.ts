import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspaceStatus,
  updateWorkspace,
  deleteWorkspace,
} from "./workspace";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserByClerkId } from "@/data/user";
import {
  findWorkspaceById,
  findWorkspaces,
  getHighestPosition,
  insertWorkspace,
  updateWorkspaceData,
  deleteWorkspaceById,
} from "@/data/workspace";
import { WorkspaceStatus } from "@prisma/client";

// Mocks
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/data/user", () => ({
  getUserByClerkId: vi.fn(),
  syncUser: vi.fn(),
}));

vi.mock("@/data/workspace", () => ({
  findWorkspaceById: vi.fn(),
  findWorkspaces: vi.fn(),
  getHighestPosition: vi.fn(),
  insertWorkspace: vi.fn(),
  updateWorkspaceData: vi.fn(),
  deleteWorkspaceById: vi.fn(),
}));

describe("Workspace Server Actions", () => {
  const mockUser = {
    id: "user_db_123",
    clerkId: "clerk_user_123",
    email: "architect@cloudflow.dev",
    name: "System Architect",
    imageUrl: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWorkspace", () => {
    it("should return validation error for empty workspace name", async () => {
      const result = await createWorkspace({ name: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Workspace name is required");
    });

    it("should return unauthorized when user session is missing", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null, orgId: null } as never);

      const result = await createWorkspace({ name: "Core Cluster" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should calculate position and insert workspace in personal scope", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);
      vi.mocked(getHighestPosition).mockResolvedValue(0);

      const createdMock = {
        id: "ws_new_1",
        name: "Kubernetes Mesh",
        description: "Service mesh diagram",
        creatorId: mockUser.id,
        clerkOrgId: null,
        status: WorkspaceStatus.PLANNING,
        position: 1000,
      };
      vi.mocked(insertWorkspace).mockResolvedValue(createdMock as never);

      const result = await createWorkspace({
        name: "Kubernetes Mesh",
        description: "Service mesh diagram",
      });

      expect(result.success).toBe(true);
      expect(result.workspace).toEqual(createdMock);
      expect(insertWorkspace).toHaveBeenCalledWith({
        name: "Kubernetes Mesh",
        description: "Service mesh diagram",
        creatorId: mockUser.id,
        clerkOrgId: null,
        position: 1000,
        status: WorkspaceStatus.PLANNING,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/workspaces");
    });

    it("should calculate correct incremented position when existing cards exist", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: "org_alpha" } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);
      vi.mocked(getHighestPosition).mockResolvedValue(2000);
      vi.mocked(insertWorkspace).mockResolvedValue({ id: "ws_inc" } as never);

      await createWorkspace({ name: "Payment Pipeline" });

      expect(insertWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 3000,
          clerkOrgId: "org_alpha",
        })
      );
    });
  });

  describe("getWorkspaces", () => {
    it("should return unauthorized error when session is null", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null, orgId: null } as never);

      const result = await getWorkspaces();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
      expect(result.workspaces).toEqual([]);
    });

    it("should call findWorkspaces with personal scope when no org is active", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const mockList = [
        { id: "ws_1", name: "Personal Architecture", status: WorkspaceStatus.PLANNING },
      ];
      vi.mocked(findWorkspaces).mockResolvedValue(mockList as never);

      const result = await getWorkspaces();
      expect(result.success).toBe(true);
      expect(result.workspaces).toEqual(mockList);
      expect(findWorkspaces).toHaveBeenCalledWith({
        userId: mockUser.id,
        orgId: null,
      });
    });

    it("should call findWorkspaces with organization scope when orgId is present", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: "org_fintech" } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const mockList = [
        { id: "ws_2", name: "Ledger Service", status: WorkspaceStatus.IN_PROGRESS },
      ];
      vi.mocked(findWorkspaces).mockResolvedValue(mockList as never);

      const result = await getWorkspaces();
      expect(result.success).toBe(true);
      expect(findWorkspaces).toHaveBeenCalledWith({
        userId: mockUser.id,
        orgId: "org_fintech",
      });
    });
  });

  describe("getWorkspaceById", () => {
    it("should return not found error when workspace does not exist", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);
      vi.mocked(findWorkspaceById).mockResolvedValue(null);

      const result = await getWorkspaceById("ws_missing");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Workspace not found");
    });

    it("should return forbidden error when caller does not own the personal workspace", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const foreignWorkspace = {
        id: "ws_foreign",
        creatorId: "another_user_id",
        clerkOrgId: null,
      };
      vi.mocked(findWorkspaceById).mockResolvedValue(foreignWorkspace as never);

      const result = await getWorkspaceById("ws_foreign");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Forbidden");
    });

    it("should return workspace when caller is member of the organization", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: "org_team" } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const orgWorkspace = {
        id: "ws_org",
        name: "Team Topology",
        creatorId: "another_user_id",
        clerkOrgId: "org_team",
      };
      vi.mocked(findWorkspaceById).mockResolvedValue(orgWorkspace as never);

      const result = await getWorkspaceById("ws_org");
      expect(result.success).toBe(true);
      expect(result.workspace).toEqual(orgWorkspace);
    });
  });

  describe("updateWorkspaceStatus", () => {
    it("should update status and position for authorized user", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const existing = { id: "ws_1", creatorId: mockUser.id, clerkOrgId: null };
      vi.mocked(findWorkspaceById).mockResolvedValue(existing as never);

      const updated = {
        ...existing,
        status: WorkspaceStatus.DONE,
        position: 4500,
      };
      vi.mocked(updateWorkspaceData).mockResolvedValue(updated as never);

      const result = await updateWorkspaceStatus("ws_1", WorkspaceStatus.DONE, 4500);

      expect(result.success).toBe(true);
      expect(result.workspace).toEqual(updated);
      expect(updateWorkspaceData).toHaveBeenCalledWith("ws_1", {
        status: WorkspaceStatus.DONE,
        position: 4500,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/workspaces");
    });
  });

  describe("updateWorkspace", () => {
    it("should update workspace title and description", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const existing = { id: "ws_1", creatorId: mockUser.id, clerkOrgId: null };
      vi.mocked(findWorkspaceById).mockResolvedValue(existing as never);
      vi.mocked(updateWorkspaceData).mockResolvedValue({
        id: "ws_1",
        name: "Renamed Topology",
        description: "Updated desc",
      } as never);

      const result = await updateWorkspace("ws_1", {
        name: "Renamed Topology",
        description: "Updated desc",
      });

      expect(result.success).toBe(true);
      expect(updateWorkspaceData).toHaveBeenCalledWith("ws_1", {
        name: "Renamed Topology",
        description: "Updated desc",
      });
    });
  });

  describe("deleteWorkspace", () => {
    it("should delete workspace when caller is creator", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_123", orgId: null } as never);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser as never);

      const existing = { id: "ws_to_delete", creatorId: mockUser.id, clerkOrgId: null };
      vi.mocked(findWorkspaceById).mockResolvedValue(existing as never);
      vi.mocked(deleteWorkspaceById).mockResolvedValue(existing as never);

      const result = await deleteWorkspace("ws_to_delete");

      expect(result.success).toBe(true);
      expect(deleteWorkspaceById).toHaveBeenCalledWith("ws_to_delete");
      expect(revalidatePath).toHaveBeenCalledWith("/workspaces");
    });
  });
});
