"use server";

import { revalidatePath } from "next/cache";
import { WorkspaceStatus } from "@prisma/client";
import { getAuthenticatedUser } from "./user";
import {
  findWorkspaceById,
  findWorkspaces,
  getHighestPosition,
  insertWorkspace,
  updateWorkspaceData,
  deleteWorkspaceById,
} from "@/data/workspace";
import {
  CreateWorkspaceSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
} from "@/validators/workspace";

/**
 * Creates a new workspace at the end of the Planning column.
 */
export async function createWorkspace(input: CreateWorkspaceInput) {
  const parsed = CreateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input data",
    };
  }

  const auth = await getAuthenticatedUser();
  if (!auth) return { success: false, error: "Unauthorized" };

  const targetOrgId =
    input.clerkOrgId !== undefined ? input.clerkOrgId : (auth.orgId || null);

  const highestPos = await getHighestPosition(WorkspaceStatus.PLANNING, {
    userId: auth.user.id,
    orgId: targetOrgId,
  });

  const workspace = await insertWorkspace({
    name: parsed.data.name,
    description: parsed.data.description || null,
    creatorId: auth.user.id,
    clerkOrgId: targetOrgId,
    position: highestPos + 1000,
    status: WorkspaceStatus.PLANNING,
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  return { success: true, workspace };
}

/**
 * Fetches workspaces for the active user or organization scope.
 */
export async function getWorkspaces(filterOrgId?: string | null) {
  const auth = await getAuthenticatedUser();
  if (!auth) return { success: false, error: "Unauthorized", workspaces: [] };

  const targetOrgId =
    filterOrgId !== undefined ? filterOrgId : (auth.orgId || null);

  const workspaces = await findWorkspaces({
    userId: auth.user.id,
    orgId: targetOrgId,
  });

  return { success: true, workspaces };
}

/**
 * Fetches a single workspace by ID with security check.
 */
export async function getWorkspaceById(id: string) {
  const result = await getAuthedWorkspace(id);
  if ("error" in result) return { success: false, error: result.error };

  return { success: true, workspace: result.workspace };
}

/**
 * Updates status and position when dragging cards on Kanban.
 */
export async function updateWorkspaceStatus(
  id: string,
  status: WorkspaceStatus,
  position?: number
) {
  if (!status || !Object.values(WorkspaceStatus).includes(status)) {
    return { success: false, error: "Invalid status or position" };
  }

  const result = await getAuthedWorkspace(id);
  if ("error" in result) return { success: false, error: result.error };

  const updated = await updateWorkspaceData(id, {
    status,
    ...(position !== undefined ? { position } : {}),
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  return { success: true, workspace: updated };
}

/**
 * Updates title and description of a workspace.
 */
export async function updateWorkspace(id: string, data: UpdateWorkspaceInput) {
  if (data.name !== undefined && !data.name.trim()) {
    return { success: false, error: "Invalid update data" };
  }

  const result = await getAuthedWorkspace(id);
  if ("error" in result) return { success: false, error: result.error };

  const updated = await updateWorkspaceData(id, {
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  return { success: true, workspace: updated };
}

/**
 * Deletes a workspace and its cascaded records.
 */
export async function deleteWorkspace(id: string) {
  const result = await getAuthedWorkspace(id);
  if ("error" in result) return { success: false, error: result.error };

  await deleteWorkspaceById(id);

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  return { success: true };
}

// ============================================================================
// Private Security & Authorization Helpers
// ============================================================================

/**
 * Common security guard: validates authentication, existence, and access permission.
 */
export async function getAuthedWorkspace(id: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return { error: "Unauthorized" };

  const workspace = await findWorkspaceById(id);
  if (!workspace) return { error: "Workspace not found" };

  if (!canAccess(workspace, auth)) {
    return { error: "Forbidden: Access denied to this workspace" };
  }

  return { workspace, auth };
}

/**
 * Validates ownership or matching organization for workspace access.
 */
function canAccess(
  workspace: { creatorId: string; clerkOrgId: string | null },
  auth: { user: { id: string }; orgId?: string | null }
) {
  return (
    workspace.creatorId === auth.user.id ||
    Boolean(workspace.clerkOrgId && auth.orgId && workspace.clerkOrgId === auth.orgId)
  );
}

