"use server";

import { getAuthedWorkspace } from "./workspace";
import { upsertDocMarkdown, findDocByWorkspaceId } from "@/data/doc";

export interface DocActionResult {
  success: boolean;
  error?: string;
  markdown?: string | null;
  doc?: unknown;
}

export type SaveDocResult = DocActionResult;
export type GetDocResult = DocActionResult;

/**
 * Save technical document markdown for a workspace.
 */
export async function saveDocMarkdown(
  workspaceId: string,
  markdown: string
): Promise<DocActionResult> {
  if (!workspaceId) return { success: false, error: "Invalid workspace ID" };
  if (typeof markdown !== "string") return { success: false, error: "Invalid markdown content" };

  const auth = await getAuthedWorkspace(workspaceId);
  if ("error" in auth) return { success: false, error: auth.error };

  try {
    const doc = await upsertDocMarkdown(workspaceId, markdown);
    return { success: true, doc };
  } catch (error) {
    console.error("Failed to save doc markdown:", error);
    return { success: false, error: "Database error while saving document" };
  }
}

/**
 * Fetch technical document markdown for a workspace.
 */
export async function getDocMarkdown(
  workspaceId: string
): Promise<DocActionResult> {
  if (!workspaceId) return { success: false, error: "Invalid workspace ID" };

  const auth = await getAuthedWorkspace(workspaceId);
  if ("error" in auth) return { success: false, error: auth.error };

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
