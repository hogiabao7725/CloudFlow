"use client";

import { FileText, Network } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../ui/resizable";
import { WorkspaceItem } from "../../types/workspace";
import { ViewMode } from "./workspace-header";

interface WorkspaceSplitViewProps {
  workspace: WorkspaceItem;
  viewMode: ViewMode;
}

export function WorkspaceSplitView({ workspace, viewMode }: WorkspaceSplitViewProps) {
  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-background">
      <ResizablePanelGroup
        key={viewMode}
        direction="horizontal"
        className="h-full w-full"
      >
        {/* Left Panel: Document Specification (RFC Surface) */}
        {viewMode !== "canvas" && (
          <ResizablePanel
            defaultSize={viewMode === "doc" ? "100%" : "50%"}
            minSize={viewMode === "dual" ? "20%" : "100%"}
            maxSize={viewMode === "dual" ? "80%" : "100%"}
            id="panel-doc"
            className="flex flex-col h-full border-r border-border/80 bg-card/40"
          >
            {/* Doc Header */}
            <div className="flex items-center justify-between h-11 px-4 sm:px-5 border-b border-border/70 bg-card/80 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-sky-400" />
                <span className="text-sm font-bold text-foreground">RFC Specification</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Markdown Doc</span>
            </div>

            {/* Doc Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {workspace.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {workspace.description || "Technical architecture specification and RFC draft."}
              </p>
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-5 text-sm text-muted-foreground leading-relaxed">
                System architecture document container. BlockNote collaborative editor will mount here in Phase 5.
              </div>
            </div>
          </ResizablePanel>
        )}

        {/* Center Resize Separator Handle (Only shown in Dual View) */}
        {viewMode === "dual" && <ResizableHandle withHandle />}

        {/* Right Panel: Architecture Canvas Surface */}
        {viewMode !== "doc" && (
          <ResizablePanel
            defaultSize={viewMode === "canvas" ? "100%" : "50%"}
            minSize={viewMode === "dual" ? "20%" : "100%"}
            maxSize={viewMode === "dual" ? "80%" : "100%"}
            id="panel-canvas"
            className="flex flex-col h-full bg-background relative overflow-hidden"
          >
            {/* Canvas Header */}
            <div className="flex items-center justify-between h-11 px-4 sm:px-5 border-b border-border/70 bg-card/80 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <Network className="size-4.5 text-indigo-400" />
                <span className="text-sm font-bold text-foreground">Architecture Canvas</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Infinite Canvas</span>
            </div>

            {/* Canvas Workspace Area */}
            <div className="flex-1 h-full w-full flex items-center justify-center bg-[radial-gradient(#2E2E36_1px,transparent_1px)] [background-size:24px_24px]">
              <div className="text-center p-8 rounded-2xl border border-border/70 bg-card/60 max-w-md backdrop-blur-sm shadow-xl">
                <Network className="size-10 text-indigo-400 mx-auto mb-3.5" />
                <h3 className="text-base font-bold text-foreground">Infinite Canvas Surface</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Interactive architecture sketching canvas. tldraw engine will mount here in Phase 5.
                </p>
              </div>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
