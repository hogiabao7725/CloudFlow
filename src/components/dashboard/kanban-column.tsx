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
          <h3 className="text-sm font-bold tracking-tight text-white">{title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-white/10 px-1.5 text-xs font-bold tabular-nums text-white">
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
                ? "bg-white/[0.04] ring-1 ring-white/20"
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
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-10 min-h-[148px] text-center transition-colors">
                <span className="text-sm font-semibold text-zinc-200">No workspaces</span>
                <span className="text-xs text-zinc-400 mt-1">Drop initiatives here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
