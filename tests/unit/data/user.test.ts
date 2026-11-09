import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserByClerkId, syncUser, checkUser } from "@/data/user";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("User Data Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserByClerkId", () => {
    it("should query the database for a user with the matching clerkId", async () => {
      const mockUser = { id: "user_1", clerkId: "clerk_1", email: "test@example.com" };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await getUserByClerkId("clerk_1");
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: "clerk_1" },
      });
    });

    it("should return null if user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await getUserByClerkId("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("syncUser (and checkUser alias)", () => {
    it("should alias checkUser to syncUser", () => {
      expect(checkUser).toBe(syncUser);
    });

    it("should return null if no active Clerk session exists", async () => {
      vi.mocked(currentUser).mockResolvedValue(null);

      const result = await syncUser();
      expect(result).toBeNull();
      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });

    it("should return null if Clerk user has no email addresses", async () => {
      const mockClerkUser = {
        id: "clerk_789",
        emailAddresses: [],
        firstName: "No",
        lastName: "Mail",
        imageUrl: null,
      };

      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never);

      const result = await syncUser();
      expect(result).toBeNull();
      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });

    it("should upsert user record when authenticated with email", async () => {
      const mockClerkUser = {
        id: "clerk_456",
        emailAddresses: [{ emailAddress: "alice@example.com" }],
        firstName: "Alice",
        lastName: "Smith",
        imageUrl: "https://example.com/alice.png",
      };
      const mockUpserted = {
        id: "db_user_1",
        clerkId: "clerk_456",
        email: "alice@example.com",
        name: "Alice Smith",
        imageUrl: "https://example.com/alice.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never);
      vi.mocked(prisma.user.upsert).mockResolvedValue(mockUpserted as never);

      const result = await syncUser();
      expect(result).toEqual(mockUpserted);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: "clerk_456" },
        update: {
          name: "Alice Smith",
          imageUrl: "https://example.com/alice.png",
          email: "alice@example.com",
        },
        create: {
          clerkId: "clerk_456",
          email: "alice@example.com",
          name: "Alice Smith",
          imageUrl: "https://example.com/alice.png",
        },
      });
    });

    it("should fallback to null for name if both firstName and lastName are missing", async () => {
      const mockClerkUser = {
        id: "clerk_999",
        emailAddresses: [{ emailAddress: "anonymous@example.com" }],
        firstName: null,
        lastName: null,
        imageUrl: null,
      };
      const mockUpserted = {
        id: "db_user_2",
        clerkId: "clerk_999",
        email: "anonymous@example.com",
        name: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never);
      vi.mocked(prisma.user.upsert).mockResolvedValue(mockUpserted as never);

      const result = await syncUser();
      expect(result).toEqual(mockUpserted);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: "clerk_999" },
        update: {
          name: null,
          imageUrl: null,
          email: "anonymous@example.com",
        },
        create: {
          clerkId: "clerk_999",
          email: "anonymous@example.com",
          name: null,
          imageUrl: null,
        },
      });
    });
  });
});
