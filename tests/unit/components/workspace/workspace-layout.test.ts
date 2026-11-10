import { describe, it, expect } from "vitest";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceOutline } from "@/components/workspace/workspace-outline";
import { WorkspaceDocument } from "@/components/workspace/workspace-document";
import { WorkspaceAISidebar } from "@/components/workspace/workspace-ai-sidebar";
import { WorkspacePresence } from "@/components/workspace/workspace-presence";

describe("Workspace Layout Components Contract", () => {
  it("should export WorkspaceHeader as a functional component", () => {
    expect(typeof WorkspaceHeader).toBe("function");
  });

  it("should export WorkspaceOutline as a functional component", () => {
    expect(typeof WorkspaceOutline).toBe("function");
  });

  it("should export WorkspaceDocument as a functional component", () => {
    expect(typeof WorkspaceDocument).toBe("function");
  });

  it("should export WorkspaceAISidebar as a functional component", () => {
    expect(typeof WorkspaceAISidebar).toBe("function");
  });

  it("should export WorkspacePresence as a functional component", () => {
    expect(typeof WorkspacePresence).toBe("function");
  });
});
