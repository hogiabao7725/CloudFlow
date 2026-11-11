"use client";

import { useState, useSyncExternalStore } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";
import { useKanban } from "@/hooks/use-kanban";
import { KanbanColumn } from "./kanban-column";
import { KanbanToolbar } from "./kanban-toolbar";
import { KanbanListView } from "./kanban-list-view";
import { KanbanDialogs } from "./kanban-dialogs";
import { CreateWorkspaceModal } from "./create-workspace-modal";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

interface KanbanBoardProps {
  initialWorkspaces: WorkspaceItem[];
  clerkOrgId?: string | null;
}

const COLUMNS = [
  {
    status: WorkspaceStatus.PLANNING,
    title: "Planning",
    dotColor: "bg-slate-400",
  },
  {
    status: WorkspaceStatus.IN_PROGRESS,
    title: "In Progress",
    dotColor: "bg-cyan-400",
  },
  {
    status: WorkspaceStatus.PAUSED,
    title: "Paused",
    dotColor: "bg-amber-400",
  },
  {
    status: WorkspaceStatus.DONE,
    title: "Done",
    dotColor: "bg-emerald-400",
  },
];

/**
 * Main dashboard container orchestrating metrics, filters, Kanban board, and list view.
 */
export function KanbanBoard({
  initialWorkspaces,
  clerkOrgId,
}: KanbanBoardProps) {
  const isMounted = useMounted();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [modalOpen, setModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<WorkspaceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceItem | null>(null);

  // Centralized state, filter, and action hook
  const { workspaces, filter, actions } = useKanban(initialWorkspaces);

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-11 w-full rounded-lg bg-card/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-0 xl:divide-x xl:divide-border/40 w-full min-h-[500px]">
          <div className="h-full rounded-lg bg-card/10 xl:px-4 xl:first:pl-0 xl:last:pr-0" />
          <div className="h-full rounded-lg bg-card/10 xl:px-4 xl:first:pl-0 xl:last:pr-0" />
          <div className="h-full rounded-lg bg-card/10 xl:px-4 xl:first:pl-0 xl:last:pr-0" />
          <div className="h-full rounded-lg bg-card/10 xl:px-4 xl:first:pl-0 xl:last:pr-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Search, filters, view toggle, and creation trigger */}
      <KanbanToolbar
        search={filter.search}
        onSearchChange={filter.setSearch}
        statusFilter={filter.status}
        onStatusFilterChange={filter.setStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenCreateModal={() => setModalOpen(true)}
      />

      {/* 2. Main content: Kanban board columns or list table */}
      {viewMode === "board" ? (
        <DragDropContext onDragEnd={actions.onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-0 xl:divide-x xl:divide-border/40 w-full items-stretch min-h-[500px]">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                dotColor={col.dotColor}
                workspaces={workspaces
                  .filter((w) => w.status === col.status)
                  .sort((a, b) => a.position - b.position)}
                onRename={(ws) => setRenameTarget(ws)}
                onDelete={(ws) => setDeleteTarget(ws)}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <KanbanListView workspaces={workspaces} />
      )}

      {/* 4. Shared creation and action dialogs */}
      <CreateWorkspaceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={actions.createWorkspace}
        clerkOrgId={clerkOrgId}
      />

      <KanbanDialogs
        renameTarget={renameTarget}
        deleteTarget={deleteTarget}
        onCloseRename={() => setRenameTarget(null)}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmRename={actions.renameWorkspace}
        onConfirmDelete={actions.deleteWorkspace}
      />
    </div>
  );
}
