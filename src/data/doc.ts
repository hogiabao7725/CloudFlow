import { prisma } from "@/lib/prisma";

export async function findDocByWorkspaceId(workspaceId: string) {
  return prisma.doc.findUnique({
    where: { workspaceId },
  });
}

export async function upsertDocMarkdown(workspaceId: string, markdown: string) {
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
