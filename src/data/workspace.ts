import { prisma } from "@/lib/prisma";
import { WorkspaceStatus } from "@prisma/client";

// Reusable creator profile selector for workspace queries
export const creatorSelect = {
  id: true,
  name: true,
  email: true,
  imageUrl: true,
};

/**
 * Finds a single workspace by ID with its creator, doc, and canvas.
 */
export async function findWorkspaceById(id: string) {
  return prisma.workspace.findUnique({
    where: { id },
    include: {
      creator: { select: creatorSelect },
      doc: true,
      canvas: true,
    },
  });
}

/**
 * Finds all workspaces belonging to a personal scope or an organization scope.
 */
export async function findWorkspaces(params: {
  userId?: string;
  orgId?: string | null;
}) {
  const where = params.orgId
    ? { clerkOrgId: params.orgId }
    : { creatorId: params.userId, clerkOrgId: null };

  return prisma.workspace.findMany({
    where,
    orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    include: {
      creator: { select: creatorSelect },
    },
  });
}

/**
 * Retrieves the highest position in a given status column (used for card ordering).
 */
export async function getHighestPosition(
  status: WorkspaceStatus,
  filter: { userId?: string; orgId?: string | null }
) {
  const where = filter.orgId
    ? { clerkOrgId: filter.orgId, status }
    : { creatorId: filter.userId, clerkOrgId: null, status };

  const highest = await prisma.workspace.findFirst({
    where,
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return highest?.position ?? 0;
}

/**
 * Inserts a new workspace and initializes 1-to-1 Doc and Canvas containers.
 */
export async function insertWorkspace(data: {
  name: string;
  description?: string | null;
  creatorId: string;
  clerkOrgId?: string | null;
  position: number;
  status?: WorkspaceStatus;
}) {
  return prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      creatorId: data.creatorId,
      clerkOrgId: data.clerkOrgId ?? null,
      status: data.status ?? WorkspaceStatus.PLANNING,
      position: data.position,
      doc: {
        create: {
          content: [],
        },
      },
      canvas: {
        create: {
          content: {},
        },
      },
    },
    include: {
      creator: { select: creatorSelect },
      doc: true,
      canvas: true,
    },
  });
}

/**
 * Updates properties (status, position, name, description) of an existing workspace.
 */
export async function updateWorkspaceData(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    status?: WorkspaceStatus;
    position?: number;
  }
) {
  return prisma.workspace.update({
    where: { id },
    data,
    include: {
      creator: { select: creatorSelect },
    },
  });
}

/**
 * Deletes a workspace record (cascades deletion of associated Doc and Canvas).
 */
export async function deleteWorkspaceById(id: string) {
  return prisma.workspace.delete({
    where: { id },
  });
}
