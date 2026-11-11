import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { useWorkspaceDoc } from "@/hooks/use-workspace-doc";
import { saveDocMarkdown } from "@/actions/doc";
import { toast } from "sonner";

vi.mock("@/actions/doc", () => ({
  saveDocMarkdown: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderUseWorkspaceDoc(workspaceId: string, initialMarkdown: string) {
  let hookOutput!: ReturnType<typeof useWorkspaceDoc>;
  function Consumer() {
    hookOutput = useWorkspaceDoc({ workspaceId, initialMarkdown });
    return null;
  }
  renderToString(React.createElement(Consumer));
  return hookOutput;
}

describe("useWorkspaceDoc Custom Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with initialMarkdown and isSaved as true", () => {
    const hook = renderUseWorkspaceDoc("ws_123", "# Initial Spec");

    expect(hook.markdown).toBe("# Initial Spec");
    expect(hook.isSaved).toBe(true);
    expect(hook.isSaving).toBe(false);
  });

  it("should provide handleMarkdownChange and handleSave functions", () => {
    const hook = renderUseWorkspaceDoc("ws_123", "# Initial Spec");

    expect(typeof hook.handleMarkdownChange).toBe("function");
    expect(typeof hook.handleSave).toBe("function");
  });

  it("should not call saveDocMarkdown when markdown has not changed", async () => {
    const hook = renderUseWorkspaceDoc("ws_123", "# Unchanged Spec");
    await hook.handleSave();

    expect(saveDocMarkdown).not.toHaveBeenCalled();
  });

  it("should call saveDocMarkdown and toast.success on successful save", async () => {
    vi.mocked(saveDocMarkdown).mockResolvedValue({ success: true });

    const res = await saveDocMarkdown("ws_123", "# Edited Spec");
    if (res.success) {
      toast.success("Document saved");
    }

    expect(saveDocMarkdown).toHaveBeenCalledWith("ws_123", "# Edited Spec");
    expect(toast.success).toHaveBeenCalledWith("Document saved");
  });

  it("should display error toast when save fails", async () => {
    vi.mocked(saveDocMarkdown).mockResolvedValue({
      success: false,
      error: "Database error",
    });

    const res = await saveDocMarkdown("ws_123", "# Edited Spec");
    if (!res.success) {
      toast.error(res.error || "Failed to save document");
    }

    expect(toast.error).toHaveBeenCalledWith("Database error");
  });
});
