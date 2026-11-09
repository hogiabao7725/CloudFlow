"use client";

import { FileText, Network } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceItem } from "@/types/workspace";
import { ViewMode } from "./workspace-view-toggle";

interface WorkspaceSplitViewProps {
  workspace?: WorkspaceItem;
  viewMode: ViewMode;
}

/**
 * Resizable split view hosting the Document panel (left)
 * and the Canvas panel (right).
 */
export function WorkspaceSplitView({
  viewMode,
}: WorkspaceSplitViewProps) {
  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-background">
      <ResizablePanelGroup
        key={viewMode}
        direction="horizontal"
        className="h-full w-full"
      >
        {/* Document Panel */}
        {viewMode !== "canvas" && (
          <ResizablePanel
            defaultSize={viewMode === "doc" ? 100 : 50}
            minSize={viewMode === "dual" ? 25 : 100}
            maxSize={viewMode === "dual" ? 75 : 100}
            id="panel-doc"
            className="flex flex-col h-full border-r border-border/80 bg-card/40 min-w-0"
          >
            {/* Minimal Doc Header */}
            <div className="flex items-center h-10 px-4 border-b border-border/70 bg-card/80 shrink-0 select-none">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-sky-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  Document
                </span>
              </div>
            </div>

            {/* Doc Body - Ready for BlockNote */}
            <div className="flex-1 w-full h-full bg-card/20 overflow-auto" />
          </ResizablePanel>
        )}

        {/* Drag Resize Handle (Dual View Only) */}
        {viewMode === "dual" && <ResizableHandle withHandle />}

        {/* Canvas Panel */}
        {viewMode !== "doc" && (
          <ResizablePanel
            defaultSize={viewMode === "canvas" ? 100 : 50}
            minSize={viewMode === "dual" ? 25 : 100}
            maxSize={viewMode === "dual" ? 75 : 100}
            id="panel-canvas"
            className="flex flex-col h-full bg-background relative overflow-hidden min-w-0"
          >
            {/* Minimal Canvas Header */}
            <div className="flex items-center h-10 px-4 border-b border-border/70 bg-card/80 shrink-0 select-none z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Network className="size-4 text-indigo-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  Canvas
                </span>
              </div>
            </div>

            {/* Canvas Body - Ready for tldraw */}
            <div className="flex-1 w-full h-full bg-background relative overflow-hidden" />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
