import { prisma } from "@/lib/prisma";

/**
 * Find technical document record by associated workspace ID.
 */
export async function findDocByWorkspaceId(workspaceId: string) {
  return prisma.doc.findUnique({
    where: { workspaceId },
  });
}

/**
 * Upsert document markdown content for a given workspace.
 * Creates the doc record if it does not exist yet; updates markdown if it does.
 */
export async function upsertDocMarkdown(
  workspaceId: string,
  markdown: string
) {
  return prisma.doc.upsert({
    where: { workspaceId },
    update: {
      markdown,
    },
    create: {
      workspaceId,
      markdown,
    },
  });
}
