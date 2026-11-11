import { describe, it, expect, vi, beforeEach } from "vitest";
import { findDocByWorkspaceId, upsertDocMarkdown } from "@/data/doc";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    doc: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("Doc Data Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findDocByWorkspaceId", () => {
    it("should query document by workspaceId", async () => {
      const mockDoc = {
        id: "doc_123",
        workspaceId: "ws_456",
        markdown: "# Spec Title",
      };
      vi.mocked(prisma.doc.findUnique).mockResolvedValue(mockDoc as never);

      const result = await findDocByWorkspaceId("ws_456");
      expect(result).toEqual(mockDoc);
      expect(prisma.doc.findUnique).toHaveBeenCalledWith({
        where: { workspaceId: "ws_456" },
      });
    });
  });

  describe("upsertDocMarkdown", () => {
    it("should upsert markdown text directly for a given workspaceId", async () => {
      const mockSavedDoc = {
        id: "doc_123",
        workspaceId: "ws_456",
        markdown: "## Updated Architecture",
      };
      vi.mocked(prisma.doc.upsert).mockResolvedValue(mockSavedDoc as never);

      const result = await upsertDocMarkdown(
        "ws_456",
        "## Updated Architecture"
      );
      expect(result).toEqual(mockSavedDoc);
      expect(prisma.doc.upsert).toHaveBeenCalledWith({
        where: { workspaceId: "ws_456" },
        update: {
          markdown: "## Updated Architecture",
        },
        create: {
          workspaceId: "ws_456",
          markdown: "## Updated Architecture",
        },
      });
    });
  });
});
