import { redirect } from "next/navigation";
import { syncUser } from "@/data/user";
import { getWorkspaces } from "@/actions/workspace";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { WorkspaceItem } from "@/types/workspace";

export const metadata = {
  title: "Dashboard | CloudFlow",
  description: "Manage system architecture workspaces across Kanban stages.",
};

export default async function DashboardPage() {
  const user = await syncUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { workspaces = [] } = await getWorkspaces();
  const displayName = user.name || user.email.split("@")[0] || "Explorer";

  return (
    <div className="flex flex-1 flex-col px-6 sm:px-10 lg:px-12 py-8 max-w-[1720px] mx-auto w-full">
      {/* Scope and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>{displayName}&apos;s Workspace</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Personal Scope</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Architecture Initiatives
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Organize, track, and collaborate on system architecture workspaces from concept to delivery.
          </p>
        </div>
      </div>

      {/* Main Kanban Board Interface */}
      <KanbanBoard
        initialWorkspaces={workspaces as unknown as WorkspaceItem[]}
      />
    </div>
  );
}
