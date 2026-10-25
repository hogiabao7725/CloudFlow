"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserByClerkId, syncUser } from "@/data/user";
import {
  findWorkspaceById,
  findWorkspaces,
  getHighestPosition,
  insertWorkspace,
  updateWorkspaceData,
  deleteWorkspaceById,
} from "@/data/workspace";
import { WorkspaceStatus } from "@prisma/client";

// Input validation schemas
const CreateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(100, "Name must be under 100 characters"),
  description: z.string().trim().max(500, "Description must be under 500 characters").optional(),
  clerkOrgId: z.string().nullable().optional(),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(100, "Name must be under 100 characters").optional(),
  description: z.string().trim().max(500, "Description must be under 500 characters").nullable().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.nativeEnum(WorkspaceStatus),
  position: z.number().optional(),
});

// Helper to authenticate caller and ensure user record is synchronized
async function getAuthenticatedUser() {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  let user = await getUserByClerkId(userId);
  if (!user) {
    user = await syncUser();
  }
  if (!user) return null;

  return { user, userId, orgId };
}

// Check if user has read/write permissions on the given workspace
function canAccessWorkspace(
  workspace: { creatorId: string; clerkOrgId: string | null },
  authContext: { user: { id: string }; orgId?: string | null }
): boolean {
  if (workspace.creatorId === authContext.user.id) return true;
  if (workspace.clerkOrgId && authContext.orgId && workspace.clerkOrgId === authContext.orgId) {
    return true;
  }
  return false;
}

/**
 * Creates a new workspace with initialized 1-to-1 Doc and Canvas containers.
 */
export async function createWorkspace(input: {
  name: string;
  description?: string;
  clerkOrgId?: string | null;
}) {
  const validation = CreateWorkspaceSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid input data",
    };
  }

  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized" };
  }

  const targetOrgId =
    input.clerkOrgId !== undefined ? input.clerkOrgId : (authContext.orgId || null);

  try {
    const highestPos = await getHighestPosition(WorkspaceStatus.PLANNING, {
      userId: authContext.user.id,
      orgId: targetOrgId,
    });

    const nextPosition = highestPos + 1000;

    const workspace = await insertWorkspace({
      name: validation.data.name,
      description: validation.data.description || null,
      creatorId: authContext.user.id,
      clerkOrgId: targetOrgId,
      position: nextPosition,
      status: WorkspaceStatus.PLANNING,
    });

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");

    return { success: true, workspace };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workspace",
    };
  }
}

/**
 * Fetches workspaces for the active personal or organization scope.
 */
export async function getWorkspaces(filterOrgId?: string | null) {
  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized", workspaces: [] };
  }

  const targetOrgId =
    filterOrgId !== undefined ? filterOrgId : (authContext.orgId || null);

  try {
    const workspaces = await findWorkspaces({
      userId: authContext.user.id,
      orgId: targetOrgId,
    });

    return { success: true, workspaces };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workspaces",
      workspaces: [],
    };
  }
}

/**
 * Fetches a single workspace by ID with authorization check.
 */
export async function getWorkspaceById(id: string) {
  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workspace = await findWorkspaceById(id);

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    if (!canAccessWorkspace(workspace, authContext)) {
      return { success: false, error: "Forbidden: Access denied to this workspace" };
    }

    return { success: true, workspace };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workspace",
    };
  }
}

/**
 * Updates the Kanban board status and relative order position of a workspace.
 */
export async function updateWorkspaceStatus(
  id: string,
  status: WorkspaceStatus,
  position?: number
) {
  const validation = UpdateStatusSchema.safeParse({ status, position });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid status or position",
    };
  }

  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await findWorkspaceById(id);

    if (!existing) {
      return { success: false, error: "Workspace not found" };
    }

    if (!canAccessWorkspace(existing, authContext)) {
      return { success: false, error: "Forbidden: Access denied to this workspace" };
    }

    const updated = await updateWorkspaceData(id, {
      status: validation.data.status,
      ...(validation.data.position !== undefined
        ? { position: validation.data.position }
        : {}),
    });

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");

    return { success: true, workspace: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update workspace status",
    };
  }
}

/**
 * Updates the title and description of an existing workspace.
 */
export async function updateWorkspace(
  id: string,
  data: { name?: string; description?: string | null }
) {
  const validation = UpdateWorkspaceSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid update data",
    };
  }

  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await findWorkspaceById(id);

    if (!existing) {
      return { success: false, error: "Workspace not found" };
    }

    if (!canAccessWorkspace(existing, authContext)) {
      return { success: false, error: "Forbidden: Access denied to this workspace" };
    }

    const updated = await updateWorkspaceData(id, {
      ...(validation.data.name !== undefined ? { name: validation.data.name } : {}),
      ...(validation.data.description !== undefined
        ? { description: validation.data.description }
        : {}),
    });

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");

    return { success: true, workspace: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
}

/**
 * Deletes a workspace and its cascaded doc/canvas records.
 */
export async function deleteWorkspace(id: string) {
  const authContext = await getAuthenticatedUser();
  if (!authContext) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await findWorkspaceById(id);

    if (!existing) {
      return { success: false, error: "Workspace not found" };
    }

    if (!canAccessWorkspace(existing, authContext)) {
      return { success: false, error: "Forbidden: Access denied to delete this workspace" };
    }

    await deleteWorkspaceById(id);

    revalidatePath("/dashboard");
    revalidatePath("/workspaces");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete workspace",
    };
  }
}
