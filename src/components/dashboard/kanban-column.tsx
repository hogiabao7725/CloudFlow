"use client";

import { Droppable } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";
import { WorkspaceCard } from "./workspace-card";

interface KanbanColumnProps {
  status: WorkspaceStatus;
  title: string;
  dotColor: string;
  workspaces: WorkspaceItem[];
  onRename?: (workspace: WorkspaceItem) => void;
  onDelete?: (workspace: WorkspaceItem) => void;
}

export function KanbanColumn({
  status,
  title,
  dotColor,
  workspaces,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-0 w-full flex-1 xl:px-4 xl:first:pl-0 xl:last:pr-0">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className={`size-2.5 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-border/50 bg-secondary/80 px-1.5 text-xs font-semibold tabular-nums text-foreground/90">
            {workspaces.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2.5 flex-1 min-h-95 rounded-lg p-1 transition-colors duration-150 ${
              snapshot.isDraggingOver
                ? "bg-secondary/30 ring-1 ring-border/60"
                : "bg-transparent"
            }`}
          >
            {workspaces.map((workspace, index) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                index={index}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}

            {workspaces.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/30 py-10 min-h-36 text-center">
                <span className="text-xs font-medium text-muted-foreground/60">No workspaces</span>
                <span className="text-[11px] text-muted-foreground/40 mt-0.5">Drop initiatives here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
