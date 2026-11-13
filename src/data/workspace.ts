import { prisma } from "@/lib/prisma";
import { WorkspaceStatus, Prisma } from "@prisma/client";
import type { GitHubPrInfo } from "@/types/workspace";

// Fields of the creator safe to return to the client
export const creatorSelect = {
  id: true,
  name: true,
  email: true,
  imageUrl: true,
};

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

// Build WHERE clause based on organization or personal workspace context
function scopeWhere(filter: ScopeFilter) {
  return filter.orgId
    ? { clerkOrgId: filter.orgId }
    : { creatorId: filter.userId, clerkOrgId: null };
}

export async function findWorkspaceById(id: string) {
  return prisma.workspace.findUnique({
    where: { id },
    include: {
      creator: { select: creatorSelect },
      doc: true,
    },
  });
}

export async function findWorkspaces(filter: ScopeFilter) {
  return prisma.workspace.findMany({
    where: scopeWhere(filter),
    orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    include: {
      creator: { select: creatorSelect },
    },
  });
}

export async function getHighestPosition(
  status: WorkspaceStatus,
  filter: ScopeFilter,
) {
  const res = await prisma.workspace.aggregate({
    where: { ...scopeWhere(filter), status },
    _max: { position: true },
  });

  return res._max.position ?? 0;
}

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

export async function updateWorkspaceData(
  id: string,
  data: UpdateWorkspaceInput,
) {
  return prisma.workspace.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      position: data.position,
      ...(data.githubPr !== undefined
        ? {
            githubPr:
              data.githubPr === null
                ? Prisma.JsonNull
                : (data.githubPr as unknown as Prisma.InputJsonValue),
          }
        : {}),
    },
    include: {
      creator: { select: creatorSelect },
    },
  });
}

export async function updateWorkspaceGitHubPr(
  id: string,
  githubPr: GitHubPrInfo | null,
) {
  return updateWorkspaceData(id, { githubPr });
}

export async function deleteWorkspaceById(id: string) {
  return prisma.workspace.delete({
    where: { id },
  });
}
