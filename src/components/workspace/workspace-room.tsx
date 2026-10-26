"use client";

import { useState } from "react";
import { WorkspaceItem } from "@/types/workspace";
import { WorkspaceHeader, ViewMode } from "./workspace-header";
import { WorkspaceSplitView } from "./workspace-split-view";
import { AIAssistantDrawer } from "./ai-assistant-drawer";

interface WorkspaceRoomProps {
  initialWorkspace: WorkspaceItem;
}

export function WorkspaceRoom({ initialWorkspace }: WorkspaceRoomProps) {
  const [workspace, setWorkspace] = useState<WorkspaceItem>(initialWorkspace);
  const [viewMode, setViewMode] = useState<ViewMode>("dual");
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const handleWorkspaceUpdated = (updated: Partial<WorkspaceItem>) => {
    setWorkspace((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background relative">
      {/* Workspace Room Header with View Toggle, Rename, Share Link */}
      <WorkspaceHeader
        workspace={workspace}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        aiDrawerOpen={aiDrawerOpen}
        onToggleAiDrawer={() => setAiDrawerOpen((prev) => !prev)}
        onWorkspaceUpdated={handleWorkspaceUpdated}
      />

      {/* Resizable Split-View */}
      <div className="flex-1 w-full overflow-hidden">
        <WorkspaceSplitView workspace={workspace} viewMode={viewMode} />
      </div>

      {/* Slide-out AI Assistant Drawer (Ready for Phase 6) */}
      <AIAssistantDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        workspaceName={workspace.name}
      />
    </div>
  );
}
