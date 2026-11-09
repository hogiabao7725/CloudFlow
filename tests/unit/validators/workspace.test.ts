import { describe, it, expect } from "vitest";
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  UpdateStatusSchema,
} from "@/validators/workspace";
import { WorkspaceStatus } from "@prisma/client";

describe("Workspace Validation Schemas", () => {
  describe("CreateWorkspaceSchema", () => {
    it("should validate valid workspace creation input", () => {
      const result = CreateWorkspaceSchema.safeParse({
        name: "Cloud Architecture",
        description: "RFC Specification for AWS Infrastructure",
        clerkOrgId: "org_123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty or whitespace-only name", () => {
      const result = CreateWorkspaceSchema.safeParse({
        name: "   ",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Workspace name is required");
      }
    });

    it("should reject name exceeding 100 characters", () => {
      const result = CreateWorkspaceSchema.safeParse({
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Name must be under 100 characters");
      }
    });

    it("should reject description exceeding 500 characters", () => {
      const result = CreateWorkspaceSchema.safeParse({
        name: "Valid Name",
        description: "d".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Description must be under 500 characters");
      }
    });
  });

  describe("UpdateWorkspaceSchema", () => {
    it("should allow partial valid updates", () => {
      const result = UpdateWorkspaceSchema.safeParse({
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
    });

    it("should allow clearing description with null", () => {
      const result = UpdateWorkspaceSchema.safeParse({
        description: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateStatusSchema", () => {
    it("should validate valid Kanban status and position", () => {
      const result = UpdateStatusSchema.safeParse({
        status: WorkspaceStatus.IN_PROGRESS,
        position: 1500,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status string", () => {
      const result = UpdateStatusSchema.safeParse({
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });
});
