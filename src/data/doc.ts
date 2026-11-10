import { prisma } from "@/lib/prisma";

export interface DocContentPayload {
  markdown: string;
}

/**
 * Find document record by associated workspace ID.
 */
export async function findDocByWorkspaceId(workspaceId: string) {
  return prisma.doc.findUnique({
    where: { workspaceId },
  });
}

/**
 * Upsert document markdown content for a given workspace.
 * Creates the doc record if it does not exist yet; updates content if it does.
 */
export async function upsertDocMarkdown(
  workspaceId: string,
  markdown: string
) {
  return prisma.doc.upsert({
    where: { workspaceId },
    update: {
      content: { markdown },
    },
    create: {
      workspaceId,
      content: { markdown },
    },
  });
}
