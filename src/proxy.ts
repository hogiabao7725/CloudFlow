import { clerkMiddleware } from "@clerk/nextjs/server";

// Synchronize Clerk auth context across all incoming requests.
// Protection is enforced via resource-based checks in pages and server actions.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    "/(api|trpc)(.*)",
  ],
};
