import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedUser } from "@/actions/user";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, syncUser } from "@/data/user";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/data/user", () => ({
  getUserByClerkId: vi.fn(),
  syncUser: vi.fn(),
}));

describe("User Actions", () => {
  const mockUser = {
    id: "user_db_123",
    clerkId: "clerk_123",
    email: "architect@cloudflow.dev",
    name: "Architect",
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthenticatedUser", () => {
    it("should return null if user is not authenticated in Clerk", async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: null,
        orgId: null,
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const result = await getAuthenticatedUser();
      expect(result).toBeNull();
    });

    it("should return authenticated user when found in database", async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: "clerk_123",
        orgId: "org_123",
      } as unknown as Awaited<ReturnType<typeof auth>>);
      vi.mocked(getUserByClerkId).mockResolvedValue(mockUser);

      const result = await getAuthenticatedUser();
      expect(result).toEqual({
        user: mockUser,
        userId: "clerk_123",
        orgId: "org_123",
      });
      expect(getUserByClerkId).toHaveBeenCalledWith("clerk_123");
      expect(syncUser).not.toHaveBeenCalled();
    });

    it("should sync user when not yet in database", async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: "clerk_123",
        orgId: null,
      } as unknown as Awaited<ReturnType<typeof auth>>);
      vi.mocked(getUserByClerkId).mockResolvedValue(null);
      vi.mocked(syncUser).mockResolvedValue(mockUser);

      const result = await getAuthenticatedUser();
      expect(result).toEqual({
        user: mockUser,
        userId: "clerk_123",
        orgId: null,
      });
      expect(syncUser).toHaveBeenCalled();
    });

    it("should return null if sync fails to produce a user", async () => {
      vi.mocked(auth).mockResolvedValue({
        userId: "clerk_123",
        orgId: null,
      } as unknown as Awaited<ReturnType<typeof auth>>);
      vi.mocked(getUserByClerkId).mockResolvedValue(null);
      vi.mocked(syncUser).mockResolvedValue(null);

      const result = await getAuthenticatedUser();
      expect(result).toBeNull();
    });
  });
});
