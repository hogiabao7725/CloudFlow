"use client";

import { useState, useMemo } from "react";
import { WorkspaceItem } from "@/types/workspace";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "./header/workspace-header";
import {
  WorkspaceOutline,
  extractHeadingsFromMarkdown,
} from "./outline/workspace-outline";
import { WorkspaceDocument } from "./document/workspace-document";
import { WorkspaceAISidebar } from "./ai/workspace-ai-sidebar";
import { MOCK_RFC_MARKDOWN } from "@/mock/workspace-spec-mock";
import { useWorkspaceDoc } from "@/hooks/use-workspace-doc";
import { SHOW_AI_COPILOT } from "@/utils/ai";

interface WorkspaceRoomProps {
  initialWorkspace: WorkspaceItem;
}

function getInitialMarkdown(ws: WorkspaceItem): string {
  if (ws.doc?.markdown && ws.doc.markdown.trim().length > 0) {
    return ws.doc.markdown;
  }
  return MOCK_RFC_MARKDOWN;
}

export function WorkspaceRoom({ initialWorkspace }: WorkspaceRoomProps) {
  const [workspace, setWorkspace] = useState<WorkspaceItem>(initialWorkspace);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const initialContent = useMemo(
    () => getInitialMarkdown(initialWorkspace),
    [initialWorkspace]
  );

  const {
    markdown,
    isSaving,
    isSaved,
    handleMarkdownChange,
    handleSave,
  } = useWorkspaceDoc({
    workspaceId: workspace.id,
    initialMarkdown: initialContent,
  });

  // Dynamically extract outline headings from markdown
  const headings = useMemo(
    () => extractHeadingsFromMarkdown(markdown),
    [markdown]
  );

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

  const handleInsertSnippet = (snippet: string) => {
    const updated = `${markdown.trimEnd()}\n\n${snippet}\n`;
    handleMarkdownChange(updated);
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
          key={SHOW_AI_COPILOT ? `${outlineOpen}-${aiOpen}` : `${outlineOpen}`}
          direction="horizontal"
          className="h-full w-full"
        >
          {/* Left: Dynamic Markdown Outline Panel (~22%) */}
          {outlineOpen && (
            <>
              <ResizablePanel
                id="panel-outline"
                defaultSize="22%"
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
                  documentTitle={workspace.name}
                  workspaceId={workspace.id}
                  githubPr={workspace.githubPr}
                  onPrUpdated={(pr) => handleWorkspaceUpdated({ githubPr: pr })}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Main Markdown Document Workbench (~78% or 100%) */}
          <ResizablePanel
            id="panel-document"
            defaultSize={
              SHOW_AI_COPILOT && aiOpen
                ? outlineOpen
                  ? "60%"
                  : "75%"
                : outlineOpen
                ? "78%"
                : "100%"
            }
            minSize="30%"
            className="h-full min-w-0"
          >
            <WorkspaceDocument
              workspace={workspace}
              markdownContent={markdown}
              onMarkdownChange={handleMarkdownChange}
              onSave={handleSave}
              isSaving={isSaving}
              isSaved={isSaved}
            />
          </ResizablePanel>

          {/* Right: Resizable Copilot Assistant Sidebar (Optional / Feature Flagged) */}
          {SHOW_AI_COPILOT && aiOpen && (
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
                  documentMarkdown={markdown}
                  onInsertSnippet={handleInsertSnippet}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
