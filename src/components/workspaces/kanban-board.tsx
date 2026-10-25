"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import {
  Search,
  Plus,
  Layers,
  LayoutGrid,
  List,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { WorkspaceItem } from "@/types/workspace";
import { updateWorkspaceStatus } from "@/actions/workspace";
import { KanbanColumn } from "./kanban-column";
import { CreateWorkspaceModal } from "./create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface KanbanBoardProps {
  initialWorkspaces: WorkspaceItem[];
  clerkOrgId?: string | null;
}

const COLUMNS: {
  status: WorkspaceStatus;
  title: string;
  description: string;
  dotColor: string;
}[] = [
  {
    status: WorkspaceStatus.PLANNING,
    title: "Planning",
    description: "Initial topology ideas & concepts",
    dotColor: "bg-slate-400",
  },
  {
    status: WorkspaceStatus.IN_PROGRESS,
    title: "In Progress",
    description: "Active canvas sketching & RFC writing",
    dotColor: "bg-cyan-400",
  },
  {
    status: WorkspaceStatus.PAUSED,
    title: "Paused",
    description: "Architecture reviews or waiting decisions",
    dotColor: "bg-amber-400",
  },
  {
    status: WorkspaceStatus.DONE,
    title: "Done",
    description: "Approved & production-ready specifications",
    dotColor: "bg-emerald-400",
  },
];

export function KanbanBoard({
  initialWorkspaces,
  clerkOrgId,
}: KanbanBoardProps) {
  const isMounted = useMounted();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(initialWorkspaces);
  const [prevInitial, setPrevInitial] = useState(initialWorkspaces);
  if (prevInitial !== initialWorkspaces) {
    setPrevInitial(initialWorkspaces);
    setWorkspaces(initialWorkspaces);
  }

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [modalOpen, setModalOpen] = useState(false);

  // Real-time metrics
  const metrics = useMemo(() => {
    const total = workspaces.length;
    const planning = workspaces.filter((w) => w.status === WorkspaceStatus.PLANNING).length;
    const inProgress = workspaces.filter((w) => w.status === WorkspaceStatus.IN_PROGRESS).length;
    const done = workspaces.filter((w) => w.status === WorkspaceStatus.DONE).length;
    return { total, planning, inProgress, done };
  }, [workspaces]);

  // Filter workspaces based on search query and status filter
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      const matchesSearch =
        !search.trim() ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || w.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workspaces, search, statusFilter]);

  const handleCreated = (newWorkspace: WorkspaceItem) => {
    setWorkspaces((prev) => [...prev, newWorkspace]);
  };

  const handleDeleted = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdated = (updated: WorkspaceItem) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStatus = destination.droppableId as WorkspaceStatus;
    const previousWorkspaces = [...workspaces];

    const movedItem = workspaces.find((w) => w.id === draggableId);
    if (!movedItem) return;

    const destColumnItems = workspaces
      .filter((w) => w.status === destStatus && w.id !== draggableId)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;
    if (destColumnItems.length === 0) {
      newPosition = 1000;
    } else if (destination.index === 0) {
      newPosition = destColumnItems[0].position / 2;
    } else if (destination.index >= destColumnItems.length) {
      newPosition = destColumnItems[destColumnItems.length - 1].position + 1000;
    } else {
      const prevPos = destColumnItems[destination.index - 1].position;
      const nextPos = destColumnItems[destination.index].position;
      newPosition = (prevPos + nextPos) / 2;
    }

    const updatedMovedItem: WorkspaceItem = {
      ...movedItem,
      status: destStatus,
      position: newPosition,
      updatedAt: new Date().toISOString(),
    };

    const remainingWorkspaces = workspaces.filter((w) => w.id !== draggableId);
    setWorkspaces([...remainingWorkspaces, updatedMovedItem]);

    try {
      const res = await updateWorkspaceStatus(draggableId, destStatus, newPosition);
      if (!res.success) {
        toast.error("Failed to persist card movement");
        setWorkspaces(previousWorkspaces);
      }
    } catch {
      toast.error("Failed to persist card movement");
      setWorkspaces(previousWorkspaces);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-border/60 bg-card/40 animate-pulse" />
          ))}
        </div>
        <div className="h-12 w-full animate-pulse rounded-xl bg-card/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 rounded-2xl border border-border/60 bg-card/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* 1. Mission-Control Overview Metrics (Fills the horizontal canvas with purposeful stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Layers className="size-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
              Total Initiatives
            </span>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {metrics.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Workflow className="size-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
              In Progress
            </span>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {metrics.inProgress}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <Clock className="size-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
              Planning
            </span>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {metrics.planning}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
              Completed
            </span>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              {metrics.done}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Controls Bar: Search, Status Filters, View Mode Toggle & New Workspace */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2 rounded-2xl border border-border/70 bg-card/40">
        {/* Left: Search input & quick filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search initiatives by name, tech or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 pr-4 bg-background/80 border-border text-foreground text-sm placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl">
            {["ALL", "PLANNING", "IN_PROGRESS", "DONE"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-secondary text-foreground shadow-sm shadow-black/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle & Primary Action */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              aria-label="Kanban board view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === "board"
                  ? "bg-secondary text-foreground shadow-sm shadow-black/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List table view"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === "list"
                  ? "bg-secondary text-foreground shadow-sm shadow-black/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>List</span>
            </button>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            size="lg"
            className="h-10 px-5 gap-2 font-bold shadow-lg shadow-black/25 text-sm"
          >
            <Plus className="size-4" />
            <span>New workspace</span>
          </Button>
        </div>
      </div>

      {/* 3. Main Workspace Display (Board View vs List View) */}
      {viewMode === "board" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-start">
            {COLUMNS.map((col) => {
              const columnWorkspaces = filteredWorkspaces
                .filter((w) => w.status === col.status)
                .sort((a, b) => a.position - b.position);

              return (
                <KanbanColumn
                  key={col.status}
                  status={col.status}
                  title={col.title}
                  description={col.description}
                  dotColor={col.dotColor}
                  workspaces={columnWorkspaces}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        /* Linear-Style Compact List View */
        <div className="rounded-2xl border border-border/80 bg-card/60 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-secondary/30">
            <span className="col-span-5 sm:col-span-6">Workspace & Description</span>
            <span className="col-span-3 sm:col-span-2">Stage</span>
            <span className="col-span-2 hidden sm:block">Creator</span>
            <span className="col-span-4 sm:col-span-2 text-right">Updated</span>
          </div>

          <div className="divide-y divide-border/60">
            {filteredWorkspaces.length > 0 ? (
              filteredWorkspaces.map((ws) => {
                const creatorName =
                  ws.creator?.name || ws.creator?.email?.split("@")[0] || "Architect";
                const timeAgo = formatDistanceToNow(new Date(ws.updatedAt), {
                  addSuffix: true,
                });

                return (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    className="grid grid-cols-12 gap-4 px-6 h-[64px] items-center hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="col-span-5 sm:col-span-6 pr-4 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-sm font-bold text-foreground group-hover:underline truncate"
                          title={ws.name}
                        >
                          {ws.name}
                        </span>
                        <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0" />
                      </div>
                      <p
                        className="text-xs text-muted-foreground truncate mt-0.5"
                        title={ws.description || ""}
                      >
                        {ws.description || "No description provided"}
                      </p>
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary text-foreground">
                        <span
                          className={`size-1.5 rounded-full ${
                            ws.status === "DONE"
                              ? "bg-emerald-400"
                              : ws.status === "IN_PROGRESS"
                              ? "bg-cyan-400"
                              : ws.status === "PAUSED"
                              ? "bg-amber-400"
                              : "bg-slate-400"
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
                          className="size-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-foreground">
                          {creatorName[0]?.toUpperCase()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground truncate max-w-28">
                        {creatorName}
                      </span>
                    </div>

                    <div className="col-span-4 sm:col-span-2 text-right text-xs text-muted-foreground font-mono">
                      {timeAgo}
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
      )}

      {/* Modal for creating a new workspace */}
      <CreateWorkspaceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={handleCreated}
        clerkOrgId={clerkOrgId}
      />
    </div>
  );
}
