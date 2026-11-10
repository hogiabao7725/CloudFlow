"use client";

import { useState } from "react";
import { WorkspaceItem } from "@/types/workspace";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceOutline, OutlineItem } from "./workspace-outline";
import { WorkspaceDocument } from "./workspace-document";
import { WorkspaceAISidebar } from "./workspace-ai-sidebar";

interface WorkspaceRoomProps {
  initialWorkspace: WorkspaceItem;
}

export function WorkspaceRoom({ initialWorkspace }: WorkspaceRoomProps) {
  const [workspace, setWorkspace] = useState<WorkspaceItem>(initialWorkspace);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [headings, setHeadings] = useState<OutlineItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const handleWorkspaceUpdated = (updated: Partial<WorkspaceItem>) => {
    setWorkspace((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Top Header */}
      <WorkspaceHeader
        workspace={workspace}
        outlineOpen={outlineOpen}
        onToggleOutline={() => setOutlineOpen((prev) => !prev)}
        aiOpen={aiOpen}
        onToggleAi={() => setAiOpen((prev) => !prev)}
        onWorkspaceUpdated={handleWorkspaceUpdated}
      />

      {/* Main Resizable 3-Column Studio Layout (20% Outline - 60% Document - 20% AI) */}
      <div className="flex-1 w-full overflow-hidden flex relative">
        <ResizablePanelGroup
          key={`${outlineOpen}-${aiOpen}`}
          direction="horizontal"
          className="h-full w-full"
        >
          {/* Left: Dynamic Plate.js Outline Panel (~20%) */}
          {outlineOpen && (
            <>
              <ResizablePanel
                id="panel-outline"
                defaultSize="20%"
                minSize="15%"
                maxSize="35%"
                className="h-full"
              >
                <WorkspaceOutline
                  open={outlineOpen}
                  onClose={() => setOutlineOpen(false)}
                  items={headings}
                  activeId={activeHeadingId}
                  onSelectItem={handleSelectHeading}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Main Plate.js Document Area (~60%) */}
          <ResizablePanel
            id="panel-document"
            defaultSize={
              outlineOpen && aiOpen
                ? "60%"
                : outlineOpen || aiOpen
                ? "80%"
                : "100%"
            }
            minSize="30%"
            className="h-full min-w-0"
          >
            <WorkspaceDocument
              workspace={workspace}
              onHeadingsChange={setHeadings}
            />
          </ResizablePanel>

          {/* Right: Resizable AI Assistant Sidebar (~20%) */}
          {aiOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="panel-ai"
                defaultSize="20%"
                minSize="15%"
                maxSize="35%"
                className="h-full"
              >
                <WorkspaceAISidebar
                  open={aiOpen}
                  onClose={() => setAiOpen(false)}
                  workspaceName={workspace.name}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
