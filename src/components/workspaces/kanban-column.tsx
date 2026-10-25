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
  onDeleted?: (id: string) => void;
  onUpdated?: (workspace: WorkspaceItem) => void;
}

export function KanbanColumn({
  status,
  title,
  description,
  dotColor,
  workspaces,
  onDeleted,
  onUpdated,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card/40 p-4 min-w-[300px] w-full flex-1">
      {/* Column Header */}
      <div className="mb-4 px-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`size-2.5 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`} />
            <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
          </div>
          <span className="flex min-w-6 h-6 items-center justify-center rounded-full bg-secondary px-2 text-xs font-bold text-foreground">
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
            className={`flex flex-col gap-3 flex-1 min-h-[380px] rounded-xl p-1 transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-secondary/40 ring-1 ring-foreground/10" : ""
            }`}
          >
            {workspaces.map((workspace, index) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                index={index}
                onDeleted={onDeleted}
                onUpdated={onUpdated}
              />
            ))}
            {provided.placeholder}

            {workspaces.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-14 text-center">
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
