import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserByClerkId, createUser, syncUser, checkUser } from "./user";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
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

  describe("createUser", () => {
    it("should insert a new user record with provided fields", async () => {
      const input = {
        clerkId: "clerk_new",
        email: "new@example.com",
        name: "New User",
        imageUrl: "https://example.com/pic.png",
      };
      const mockCreated = { id: "user_new", ...input, createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreated as never);

      const result = await createUser(input);
      expect(result).toEqual(mockCreated);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: input });
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
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("should return existing user without creating a new record", async () => {
      const mockClerkUser = {
        id: "clerk_123",
        emailAddresses: [{ emailAddress: "existing@example.com" }],
        firstName: "Existing",
        lastName: "User",
        imageUrl: null,
      };
      const mockDbUser = {
        id: "db_1",
        clerkId: "clerk_123",
        email: "existing@example.com",
        name: "Existing User",
        imageUrl: null,
      };

      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as never);

      const result = await syncUser();
      expect(result).toEqual(mockDbUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should create new user record if user is not in database", async () => {
      const mockClerkUser = {
        id: "clerk_456",
        emailAddresses: [{ emailAddress: "brand_new@example.com" }],
        firstName: "Brand",
        lastName: "New",
        imageUrl: "https://example.com/avatar.png",
      };
      const mockCreated = {
        id: "db_2",
        clerkId: "clerk_456",
        email: "brand_new@example.com",
        name: "Brand New",
        imageUrl: "https://example.com/avatar.png",
      };

      vi.mocked(currentUser).mockResolvedValue(mockClerkUser as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreated as never);

      const result = await syncUser();
      expect(result).toEqual(mockCreated);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: "clerk_456",
          email: "brand_new@example.com",
          name: "Brand New",
          imageUrl: "https://example.com/avatar.png",
        },
      });
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
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await syncUser();
      expect(result).toBeNull();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
