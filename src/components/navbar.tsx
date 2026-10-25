"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  OrganizationSwitcher,
  useAuth,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

// Top navigation bar shared across routes, providing identity and organization management.
export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-8">
      {/* Brand logo */}
      <Link
        href={isSignedIn && !isLandingPage ? "/dashboard" : "/"}
        className="flex items-center gap-2.5 font-semibold text-base tracking-tight transition-colors hover:text-primary"
      >
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          CF
        </div>
        <span className="flex items-center gap-1 font-bold text-base text-foreground">
          Cloud<span className="text-foreground/70">Flow</span>
        </span>
      </Link>

      {/* Auth & Navigation actions */}
      <div className="flex items-center gap-3">
        {/* Signed Out */}
        <Show when="signed-out">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card/60 hover:bg-card text-foreground"
            >
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button size="sm">Start workspace</Button>
          </SignUpButton>
        </Show>

        {/* Signed In */}
        <Show when="signed-in">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "flex items-center",
              },
            }}
          />
          {isLandingPage && (
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </Show>
      </div>
    </header>
  );
}
