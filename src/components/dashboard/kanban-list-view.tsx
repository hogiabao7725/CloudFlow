import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { WorkspaceItem } from "@/types/workspace";

interface KanbanListViewProps {
  workspaces: WorkspaceItem[];
}

/**
 * Compact tabular list view for workspaces.
 */
export function KanbanListView({ workspaces }: KanbanListViewProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-card/90 overflow-hidden shadow-xs">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-white/[0.03]">
        <span className="col-span-4 sm:col-span-4">Workspace & Description</span>
        <span className="col-span-2 sm:col-span-2">Stage</span>
        <span className="col-span-2 hidden sm:block">Creator</span>
        <span className="col-span-2 hidden md:block text-right">Created</span>
        <span className="col-span-4 sm:col-span-4 md:col-span-2 text-right">Updated</span>
      </div>

      <div className="divide-y divide-white/10">
        {workspaces.length > 0 ? (
          workspaces.map((ws) => {
            const creatorName =
              ws.creator?.name || ws.creator?.email?.split("@")[0] || "Architect";
            const createdDate = format(new Date(ws.createdAt), "dd/MM/yyyy HH:mm");
            const updatedDate = format(new Date(ws.updatedAt), "dd/MM/yyyy HH:mm");

            return (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="grid grid-cols-12 gap-4 px-6 h-16 items-center hover:bg-white/[0.04] transition-colors group"
              >
                <div className="col-span-4 sm:col-span-4 pr-4 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-sm font-bold text-white group-hover:underline truncate"
                      title={ws.name}
                    >
                      {ws.name}
                    </span>
                    <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity shrink-0" />
                  </div>
                  <p
                    className="text-xs text-zinc-400 truncate mt-0.5"
                    title={ws.description || ""}
                  >
                    {ws.description || "No description provided"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-white border border-white/10">
                    <span
                      className={`size-1.5 rounded-full ${
                        ws.status === "DONE"
                          ? "bg-emerald-400"
                          : ws.status === "IN_PROGRESS"
                          ? "bg-sky-400"
                          : ws.status === "PAUSED"
                          ? "bg-amber-400"
                          : "bg-zinc-400"
                      }`}
                    />
                    <span>{ws.status.replace("_", " ")}</span>
                  </span>
                </div>

                <div className="col-span-2 hidden sm:flex items-center gap-2">
                  {ws.creator?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ws.creator.imageUrl}
                      alt={creatorName}
                      className="size-5 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white">
                      {creatorName[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-zinc-300 truncate max-w-28">
                    {creatorName}
                  </span>
                </div>

                <div className="col-span-2 hidden md:block text-right text-xs text-zinc-400 tabular-nums">
                  {createdDate}
                </div>

                <div className="col-span-4 sm:col-span-4 md:col-span-2 text-right text-xs text-zinc-300 font-medium tabular-nums">
                  {updatedDate}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No initiatives match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
