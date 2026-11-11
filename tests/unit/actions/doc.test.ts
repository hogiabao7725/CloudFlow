import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveDocMarkdown, getDocMarkdown } from "@/actions/doc";
import { getAuthedWorkspace } from "@/actions/workspace";
import { upsertDocMarkdown, findDocByWorkspaceId } from "@/data/doc";

vi.mock("@/actions/workspace", () => ({
  getAuthedWorkspace: vi.fn(),
}));

vi.mock("@/data/doc", () => ({
  upsertDocMarkdown: vi.fn(),
  findDocByWorkspaceId: vi.fn(),
}));

describe("Doc Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveDocMarkdown", () => {
    it("should reject invalid workspace ID", async () => {
      const result = await saveDocMarkdown("", "# Spec");
      expect(result).toEqual({
        success: false,
        error: "Invalid workspace ID",
      });
    });

    it("should reject non-string markdown content", async () => {
      const result = await saveDocMarkdown(
        "ws_123",
        null as unknown as string
      );
      expect(result).toEqual({
        success: false,
        error: "Invalid markdown content",
      });
    });

    it("should reject unauthorized workspace access", async () => {
      vi.mocked(getAuthedWorkspace).mockResolvedValue({
        error: "Forbidden: Access denied to this workspace",
      });

      const result = await saveDocMarkdown("ws_123", "# Spec");
      expect(result).toEqual({
        success: false,
        error: "Forbidden: Access denied to this workspace",
      });
    });

    it("should save doc markdown successfully when authorized", async () => {
      const mockWorkspace = {
        id: "ws_123",
        creatorId: "user_1",
        clerkOrgId: null,
      };
      const mockSavedDoc = {
        id: "doc_1",
        workspaceId: "ws_123",
        markdown: "# Spec Content",
      };

      vi.mocked(getAuthedWorkspace).mockResolvedValue({
        workspace: mockWorkspace,
        auth: { user: { id: "user_1" } },
      } as never);
      vi.mocked(upsertDocMarkdown).mockResolvedValue(mockSavedDoc as never);

      const result = await saveDocMarkdown("ws_123", "# Spec Content");
      expect(result).toEqual({
        success: true,
        doc: mockSavedDoc,
      });
      expect(upsertDocMarkdown).toHaveBeenCalledWith(
        "ws_123",
        "# Spec Content"
      );
    });

    it("should return database error when upsertDocMarkdown throws", async () => {
      vi.mocked(getAuthedWorkspace).mockResolvedValue({
        workspace: { id: "ws_123" },
        auth: { user: { id: "user_1" } },
      } as never);
      vi.mocked(upsertDocMarkdown).mockRejectedValue(
        new Error("Connection error")
      );

      const result = await saveDocMarkdown("ws_123", "# Spec Content");
      expect(result).toEqual({
        success: false,
        error: "Database error while saving document",
      });
    });
  });

  describe("getDocMarkdown", () => {
    it("should return markdown directly from doc record", async () => {
      vi.mocked(getAuthedWorkspace).mockResolvedValue({
        workspace: { id: "ws_123" },
        auth: { user: { id: "user_1" } },
      } as never);
      vi.mocked(findDocByWorkspaceId).mockResolvedValue({
        id: "doc_1",
        workspaceId: "ws_123",
        markdown: "# My RFC Specification",
      } as never);

      const result = await getDocMarkdown("ws_123");
      expect(result.success).toBe(true);
      expect(result.markdown).toBe("# My RFC Specification");
    });

    it("should return null markdown if doc has no markdown", async () => {
      vi.mocked(getAuthedWorkspace).mockResolvedValue({
        workspace: { id: "ws_123" },
        auth: { user: { id: "user_1" } },
      } as never);
      vi.mocked(findDocByWorkspaceId).mockResolvedValue({
        id: "doc_1",
        workspaceId: "ws_123",
        markdown: null,
      } as never);

      const result = await getDocMarkdown("ws_123");
      expect(result.success).toBe(true);
      expect(result.markdown).toBeNull();
    });
  });
});
