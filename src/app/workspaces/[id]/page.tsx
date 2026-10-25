import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { syncUser } from "@/data/user";
import { getWorkspaceById } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Network,
  FileText,
  Workflow,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface WorkspaceRoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceRoomPage({ params }: WorkspaceRoomPageProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const { workspace, error } = await getWorkspaceById(id);

  if (error || !workspace) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-foreground">Workspace Unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "The requested workspace could not be found or you do not have permission to view it."}
        </p>
        <Button asChild className="mt-6" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      {/* Workspace Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <span className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-sm font-bold text-foreground line-clamp-1">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">{workspace.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
            {workspace.status}
          </span>
        </div>
      </div>

      {/* Surface Canvas & Docs Dual Workspace Shell (Connected in Phase 4 & 5) */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center text-center max-w-lg rounded-2xl border border-border bg-card p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <Network className="size-5" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <FileText className="size-5" />
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {workspace.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Workspace room initialized with paired 1-to-1 Canvas (tldraw) and Docs (BlockNote) containers.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border border-border bg-secondary/40 px-2.5 py-1">
              Doc ID: {workspace.doc?.id || "Initialized"}
            </span>
            <span className="rounded-md border border-border bg-secondary/40 px-2.5 py-1">
              Canvas ID: {workspace.canvas?.id || "Initialized"}
            </span>
          </div>

          <div className="mt-8 flex gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/workspaces">Back to Kanban Board</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
