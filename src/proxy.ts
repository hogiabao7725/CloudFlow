import { clerkMiddleware } from "@clerk/nextjs/server";

const PROTECTED_ROUTES = ["/dashboard", "/workspaces"];

// Protect private routes at the Edge layer before Server Components execute.
export default clerkMiddleware(async (auth, req) => {
  const isProtected = PROTECTED_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (isProtected) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    "/(api|trpc)(.*)",
  ],
};
