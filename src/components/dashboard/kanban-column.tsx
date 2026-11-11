"use client";

import { Droppable } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { WorkspaceItem } from "@/types/workspace";
import { WorkspaceCard } from "./workspace-card";

interface KanbanColumnProps {
  status: WorkspaceStatus;
  title: string;
  description: string;
  dotColor: string;
  workspaces: WorkspaceItem[];
  onRename?: (workspace: WorkspaceItem) => void;
  onDelete?: (workspace: WorkspaceItem) => void;
}

export function KanbanColumn({
  status,
  title,
  description,
  dotColor,
  workspaces,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border/70 bg-card/40 p-3.5 min-w-75 w-full flex-1">
      {/* Column Header */}
      <div className="mb-3.5 px-0.5 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`size-2 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`} />
            <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
          </div>
          <span className="flex min-w-5 h-5 items-center justify-center rounded-md bg-secondary px-1.5 text-xs font-semibold tabular-nums text-foreground">
            {workspaces.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{description}</p>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 flex-1 min-h-95 rounded-lg p-0.5 transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-secondary/40 ring-1 ring-foreground/10" : ""
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
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-12 text-center">
                <span className="text-sm font-semibold text-muted-foreground">No workspaces</span>
                <span className="text-xs text-muted-foreground/60 mt-1">Drop initiatives here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
