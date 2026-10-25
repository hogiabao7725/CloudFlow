import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Finds a user by their Clerk ID.
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

// Persists a new user record
export async function createUser(data: {
  clerkId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}) {
  return prisma.user.create({ data });
}

// Synchronizes the authenticated Clerk user into the database on first access.
export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await getUserByClerkId(clerkUser.id);
  if (existing) return existing;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return createUser({
    clerkId: clerkUser.id,
    email,
    name:
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
    imageUrl: clerkUser.imageUrl,
  });
}

// Alias for backwards compatibility.
export const checkUser = syncUser;
