import { z } from "zod";
import { WorkspaceStatus } from "@prisma/client";

export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(100, "Name must be under 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters")
    .optional(),
  clerkOrgId: z.string().nullable().optional(),
});

export const UpdateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(100, "Name must be under 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters")
    .nullable()
    .optional(),
});

export const UpdateStatusSchema = z.object({
  status: z.nativeEnum(WorkspaceStatus),
  position: z.number().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
