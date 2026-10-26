import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { HeroAnimatedLogo } from "@/components/home/hero-animated-logo";
import {
  ArrowRight,
  Sparkles,
  Terminal,
  Cpu,
  Network,
  Users,
  KanbanSquare,
  ShieldCheck,
} from "lucide-react";

// CloudFlow landing page: minimalist, ultra-clean collaborative workspace.
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* 1. Hero Section (Clean, Confident & Minimalist) */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 md:px-10 md:pt-32 md:pb-28">
        {/* Subtle radial ambient atmosphere (Monochrome & Graphite) */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-125 w-200 rounded-full bg-radial from-zinc-400/10 via-zinc-600/5 to-transparent blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Animated Vector Brand Logo (Monochrome & Graphite Theme) */}
          <HeroAnimatedLogo />

          <p className="mt-6 font-mono text-sm sm:text-base font-semibold uppercase tracking-[0.25em] text-zinc-300 select-none">
            REALTIME ARCHITECTURE CANVAS • CLOUDFLOW
          </p>
        </div>
      </section>

      {/* 2. Core Capabilities */}
      <section className="bg-card/30 border-t border-border px-6 py-24 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl text-center mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground text-balance">
              Everything your team needs in one unified workspace
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed text-balance">
              Connect visual diagrams, engineering documentation, and smart
              assistance in a seamless workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Infinite Canvas */}
            <SpotlightCard className="text-left">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-semibold font-mono text-muted-foreground">
                    01 / CANVAS
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Network className="size-5" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Visual Canvas
                </h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                  Diagram system architectures, flowcharts, and technical
                  components together on an infinite board.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-4 border-t border-border/60">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span>Real-time collaborative diagramming</span>
              </div>
            </SpotlightCard>

            {/* Pillar 2: Block-Based RFC Documents */}
            <SpotlightCard className="text-left">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-semibold font-mono text-muted-foreground">
                    02 / SPECS
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Terminal className="size-5" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Technical Specs
                </h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                  Write clear engineering proposals, system designs, and task
                  checklists directly alongside your canvas.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-4 border-t border-border/60">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span>Live synchronized document editing</span>
              </div>
            </SpotlightCard>

            {/* Pillar 3: AI Assistant */}
            <SpotlightCard className="text-left">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-semibold font-mono text-muted-foreground">
                    03 / AI ASSISTANT
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Cpu className="size-5" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Smart AI Assistant
                </h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                  Turn concepts into structured diagrams, generate technical
                  documentation, and audit architecture designs on demand.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-4 border-t border-border/60">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span>Automated diagram & document generation</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 3. Built for High-Velocity Teams (Minimalist Bento Grid) */}
      <section className="border-t border-border px-6 py-24 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl text-center mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground text-balance">
              Built for speed, clarity and alignment
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg text-balance">
              Designed to keep engineering teams aligned from early ideas to
              production.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <SpotlightCard>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Users className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg sm:text-xl">
                    Live Team Collaboration
                  </h4>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    Work together in real time with shared presence, instant
                    cursor movements, and synchronized selections.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <KanbanSquare className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg sm:text-xl">
                    Project & Kanban Boards
                  </h4>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    Organize your architecture workspaces into simple columns to
                    track ideas from draft to delivery.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg sm:text-xl">
                    Team Workspaces & Access
                  </h4>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    Switch effortlessly between personal and team workspaces
                    with clear roles and secure authentication.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg sm:text-xl">
                    AI Workspace Creation
                  </h4>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    Describe your system concept in plain words to generate
                    initial diagrams and documentation automatically.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 4. Bottom Minimal CTA (Full-Width Background Stretched Edge-to-Edge) */}
      <section className="w-full border-t border-border bg-card/50 px-6 py-24 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Ready to build better architectures?
          </h3>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-balance">
            Start collaborating in seconds with unified canvas diagrams, specs,
            and AI assistance.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="px-7 font-semibold shadow-lg shadow-black/20"
                >
                  Start free workspace <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-7 border-border bg-card/80 hover:bg-secondary text-foreground"
                >
                  Sign in
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                size="lg"
                className="px-7 font-semibold shadow-lg shadow-black/20"
              >
                <Link href="/dashboard">
                  Open Dashboard <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </Show>
          </div>
        </div>
      </section>
    </div>
  );
}
