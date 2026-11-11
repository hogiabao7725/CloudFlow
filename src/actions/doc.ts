"use server";

import { getAuthedWorkspace } from "./workspace";
import { upsertDocMarkdown, findDocByWorkspaceId } from "@/data/doc";

export interface SaveDocResult {
  success: boolean;
  error?: string;
  doc?: unknown;
}

export interface GetDocResult {
  success: boolean;
  error?: string;
  markdown?: string | null;
  doc?: unknown;
}

/**
 * Server Action to save document markdown content for a given workspace.
 * Validates authentication and workspace access permissions.
 */
export async function saveDocMarkdown(
  workspaceId: string,
  markdown: string
): Promise<SaveDocResult> {
  if (!workspaceId || typeof workspaceId !== "string") {
    return { success: false, error: "Invalid workspace ID" };
  }

  if (typeof markdown !== "string") {
    return { success: false, error: "Invalid markdown content" };
  }

  const result = await getAuthedWorkspace(workspaceId);
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  try {
    const doc = await upsertDocMarkdown(workspaceId, markdown);
    return { success: true, doc };
  } catch (error) {
    console.error("Failed to save doc markdown:", error);
    return { success: false, error: "Database error while saving document" };
  }
}

/**
 * Server Action to fetch doc markdown for a given workspace.
 */
export async function getDocMarkdown(
  workspaceId: string
): Promise<GetDocResult> {
  if (!workspaceId || typeof workspaceId !== "string") {
    return { success: false, error: "Invalid workspace ID" };
  }

  const result = await getAuthedWorkspace(workspaceId);
  if ("error" in result) {
    return { success: false, error: result.error };
  }

  try {
    const doc = await findDocByWorkspaceId(workspaceId);
    return {
      success: true,
      markdown: doc?.markdown ?? null,
      doc,
    };
  } catch (error) {
    console.error("Failed to load doc markdown:", error);
    return { success: false, error: "Database error while fetching document" };
  }
}
