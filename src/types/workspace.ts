import { WorkspaceStatus } from "@prisma/client";

export interface WorkspaceCreator {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  description: string | null;
  status: WorkspaceStatus;
  position: number;
  clerkOrgId: string | null;
  creatorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator?: WorkspaceCreator | null;
}
