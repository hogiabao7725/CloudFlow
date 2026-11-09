"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, syncUser } from "@/data/user";

/**
 * Authenticate the caller and ensure their user record is synchronized with the database.
 */
export async function getAuthenticatedUser() {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  let user = await getUserByClerkId(userId);
  if (!user) {
    user = await syncUser();
  }
  if (!user) return null;

  return { user, userId, orgId };
}
