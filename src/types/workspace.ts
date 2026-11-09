import { WorkspaceStatus } from "@prisma/client";

export interface WorkspaceCreator {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export interface WorkspaceDoc {
  id: string;
  workspaceId?: string;
  content?: unknown;
  yjsState?: string | Uint8Array | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface WorkspaceCanvas {
  id: string;
  workspaceId?: string;
  content?: unknown;
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
  createdAt: Date | string;
  updatedAt: Date | string;
  creator?: WorkspaceCreator | null;
  doc?: WorkspaceDoc | null;
  canvas?: WorkspaceCanvas | null;
}
