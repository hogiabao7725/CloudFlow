"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
      {/* Brand logo (Pure Minimalist Wordmark) */}
      <Link
        href={isSignedIn && !isLandingPage ? "/dashboard" : "/"}
        className="flex items-center text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
      >
        <span>
          Cloud<span className="text-foreground/70">Flow</span>
        </span>
      </Link>

      {/* Auth & Navigation actions (Prominent Primary CTAs) */}
      <div className="flex items-center gap-3">
        {/* Signed Out */}
        <Show when="signed-out">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button
              variant="outline"
              size="default"
              className="h-9.5 px-4 text-sm font-semibold border-border bg-card/60 hover:bg-card text-foreground"
            >
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button
              size="default"
              className="h-9.5 px-5 text-sm font-semibold shadow-sm"
            >
              Start workspace <ArrowRight className="size-4 ml-1" />
            </Button>
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
            <Button asChild size="default" className="h-9.5 px-5 text-sm font-semibold shadow-sm">
              <Link href="/dashboard">
                Dashboard <ArrowRight className="size-4 ml-1" />
              </Link>
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
