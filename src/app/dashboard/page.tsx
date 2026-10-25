import { redirect } from "next/navigation";
import Link from "next/link";
import { syncUser } from "@/data/user";
import { DashboardPrompt } from "@/components/dashboard/dashboard-prompt";
import { Button } from "@/components/ui/button";
import {
  KanbanSquare,
  Plus,
  Network,
  FileText,
  Workflow,
  ArrowRight,
} from "lucide-react";

// Protected dashboard page, synchronizing authenticated user to PostgreSQL on first visit.
export default async function DashboardPage() {
  const user = await syncUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName = user.name || user.email.split("@")[0] || "Explorer";

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-10 max-w-7xl mx-auto w-full">
      {/* 1. Shell Scope Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-foreground/70" />
          <span className="text-sm font-medium text-foreground">
            {displayName}&apos;s Workspace
          </span>
          <span className="text-xs text-muted-foreground">
            / Personal Scope
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Link href="/workspaces">
              <KanbanSquare className="size-4" />
              <span>Kanban board</span>
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            <span>New workspace</span>
          </Button>
        </div>
      </div>

      {/* 2. Central AI Prompt Workbench */}
      <DashboardPrompt />

      {/* 3. Starter Templates / Quick Launch */}
      <section className="mx-auto w-full max-w-4xl mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            Quick start templates
          </h3>
          <span className="text-xs text-muted-foreground">
            Ready in 1 click
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Template 1: Dual Canvas + Doc */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/40 cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Network className="size-4 text-foreground" />
                <span className="text-xs text-muted-foreground">Dual View</span>
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                Blank Canvas & Spec
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Clean split workspace with synchronized infinite canvas and rich markdown document.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground">
              <span>Launch workspace</span>
              <ArrowRight className="size-3" />
            </div>
          </div>

          {/* Template 2: System Topology */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/40 cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Workflow className="size-4 text-foreground" />
                <span className="text-xs text-muted-foreground">System Design</span>
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                Cloud Architecture Blueprint
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Pre-configured nodes for API Gateway, Redis Cache, PostgreSQL, and Worker queues.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground">
              <span>Launch workspace</span>
              <ArrowRight className="size-3" />
            </div>
          </div>

          {/* Template 3: RFC Document */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/40 cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-3">
                <FileText className="size-4 text-foreground" />
                <span className="text-xs text-muted-foreground">RFC Spec</span>
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                Technical Specification
              </h4>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Standardized architecture proposal template with goals, trade-offs, and data schemas.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground">
              <span>Launch workspace</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        </div>

        {/* 4. Active Workspaces Section */}
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Recent workspaces
            </h3>
            <span className="text-xs text-muted-foreground">
              0 active
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-foreground font-medium">
              No recent workspaces found
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Select one of the templates above or submit an architecture prompt to initialize your first collaborative workspace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
