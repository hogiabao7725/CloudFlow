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

const OUTLINE_SECTIONS: OutlineItem[] = [
  { id: "sec-problem", title: "1. Problem Statement", level: 1 },
  { id: "sec-problem-context", title: "Background & Bottlenecks", level: 2 },
  { id: "sec-architecture", title: "2. System Architecture Flow", level: 1 },
  { id: "sec-architecture-sequence", title: "Asynchronous Queue Pipeline", level: 2 },
  { id: "sec-nfr", title: "3. Non-Functional Requirements", level: 1 },
  { id: "sec-nfr-latency", title: "P99 Latency & Throughput SLA", level: 2 },
  { id: "sec-security", title: "4. Security & Compliance", level: 1 },
  { id: "sec-security-iam", title: "IAM Least Privilege & KMS", level: 2 },
];

export function WorkspaceRoom({ initialWorkspace }: WorkspaceRoomProps) {
  const [workspace, setWorkspace] = useState<WorkspaceItem>(initialWorkspace);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-problem");

  const handleWorkspaceUpdated = (updated: Partial<WorkspaceItem>) => {
    setWorkspace((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
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

      {/* Main Resizable 3-Column Studio Layout */}
      <div className="flex-1 w-full overflow-hidden flex relative">
        <ResizablePanelGroup
          key={`${outlineOpen}-${aiOpen}`}
          direction="horizontal"
          className="h-full w-full"
        >
          {/* Left: Resizable Outline Panel */}
          {outlineOpen && (
            <>
              <ResizablePanel
                id="panel-outline"
                defaultSize="25%"
                minSize="15%"
                maxSize="40%"
                className="h-full"
              >
                <WorkspaceOutline
                  open={outlineOpen}
                  onClose={() => setOutlineOpen(false)}
                  items={OUTLINE_SECTIONS}
                  activeId={activeSectionId}
                  onSelectItem={handleSelectSection}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Main Document Area */}
          <ResizablePanel
            id="panel-document"
            defaultSize={
              outlineOpen && aiOpen
                ? "50%"
                : outlineOpen || aiOpen
                ? "75%"
                : "100%"
            }
            minSize="30%"
            className="h-full min-w-0"
          >
            <WorkspaceDocument workspace={workspace} />
          </ResizablePanel>

          {/* Right: Resizable AI Assistant Sidebar */}
          {aiOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="panel-ai"
                defaultSize="25%"
                minSize="15%"
                maxSize="40%"
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
