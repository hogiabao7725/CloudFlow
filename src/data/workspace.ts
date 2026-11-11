import { prisma } from "@/lib/prisma";
import { WorkspaceStatus, type Prisma } from "@prisma/client";
import type { GitHubPrInfo } from "@/types/workspace";

// Public creator fields to expose safely
export const creatorSelect = {
  id: true,
  name: true,
  email: true,
  imageUrl: true,
};

// Common scope filter for personal vs organization workspaces
export interface ScopeFilter {
  userId?: string;
  orgId?: string | null;
}

export interface InsertWorkspaceInput {
  name: string;
  description?: string | null;
  creatorId: string;
  clerkOrgId?: string | null;
  position: number;
  status?: WorkspaceStatus;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string | null;
  status?: WorkspaceStatus;
  position?: number;
  githubPr?: GitHubPrInfo | null;
}

// Build query conditions based on personal or organization context
function scopeWhere(filter: ScopeFilter) {
  return filter.orgId
    ? { clerkOrgId: filter.orgId }
    : { creatorId: filter.userId, clerkOrgId: null };
}

/**
 * Find a workspace by ID with creator and doc.
 */
export async function findWorkspaceById(id: string) {
  return prisma.workspace.findUnique({
    where: { id },
    include: {
      creator: { select: creatorSelect },
      doc: true,
    },
  });
}

/**
 * List workspaces belonging to personal or organization scope.
 */
export async function findWorkspaces(filter: ScopeFilter) {
  return prisma.workspace.findMany({
    where: scopeWhere(filter),
    orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    include: {
      creator: { select: creatorSelect },
    },
  });
}

/**
 * Get the highest position in a status column using DB MAX aggregate.
 */
export async function getHighestPosition(
  status: WorkspaceStatus,
  filter: ScopeFilter
) {
  const res = await prisma.workspace.aggregate({
    where: { ...scopeWhere(filter), status },
    _max: { position: true },
  });

  return res._max.position ?? 0;
}

/**
 * Create a workspace and initialize its 1-to-1 technical RFC doc.
 */
export async function insertWorkspace(data: InsertWorkspaceInput) {
  return prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      creatorId: data.creatorId,
      clerkOrgId: data.clerkOrgId ?? null,
      status: data.status ?? WorkspaceStatus.PLANNING,
      position: data.position,
      doc: { create: { markdown: "" } },
    },
    include: {
      creator: { select: creatorSelect },
      doc: true,
    },
  });
}

/**
 * Update workspace properties (name, description, status, position).
 */
export async function updateWorkspaceData(
  id: string,
  data: UpdateWorkspaceInput
) {
  const updatePayload: Prisma.WorkspaceUpdateInput = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.position !== undefined ? { position: data.position } : {}),
    ...(data.githubPr !== undefined
      ? { githubPr: data.githubPr as unknown as Prisma.InputJsonValue }
      : {}),
  };

  return prisma.workspace.update({
    where: { id },
    data: updatePayload,
    include: {
      creator: { select: creatorSelect },
    },
  });
}

/**
 * Update linked GitHub PR information for a given workspace.
 */
export async function updateWorkspaceGitHubPr(
  id: string,
  githubPr: GitHubPrInfo | null
) {
  return prisma.workspace.update({
    where: { id },
    data: {
      githubPr: githubPr as unknown as Prisma.InputJsonValue,
    },
    include: {
      creator: { select: creatorSelect },
    },
  });
}

/**
 * Delete a workspace and cascade delete its associated doc.
 */
export async function deleteWorkspaceById(id: string) {
  return prisma.workspace.delete({
    where: { id },
  });
}
