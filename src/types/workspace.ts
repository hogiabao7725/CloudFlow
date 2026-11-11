import { WorkspaceStatus } from "@prisma/client";

export interface WorkspaceCreator {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GitHubPrInfo {
  url: string;
  number: number;
  title: string;
  state: "open" | "merged" | "closed";
  branch: string;
  ciStatus?: "passed" | "failed" | "running" | "none";
  author?: {
    login: string;
    avatarUrl?: string;
  };
}

export interface WorkspaceDoc {
  id: string;
  workspaceId?: string;
  markdown?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  description: string | null;
  status: WorkspaceStatus;
  position: number;
  clerkOrgId: string | null;
  creatorId: string;
  shareToken?: string | null;
  githubPr?: GitHubPrInfo | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator?: WorkspaceCreator | null;
  doc?: WorkspaceDoc | null;
}
