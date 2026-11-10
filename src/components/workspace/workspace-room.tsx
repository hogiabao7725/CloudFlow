"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { WorkspaceItem } from "@/types/workspace";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "./workspace-header";
import {
  WorkspaceOutline,
  extractHeadingsFromMarkdown,
} from "./workspace-outline";
import { WorkspaceDocument } from "./workspace-document";
import { WorkspaceAISidebar } from "./workspace-ai-sidebar";
import { MOCK_RFC_MARKDOWN } from "@/mock/workspace-spec-mock";
import { saveDocMarkdown } from "@/actions/doc";

interface WorkspaceRoomProps {
  initialWorkspace: WorkspaceItem;
}

function getInitialMarkdown(ws: WorkspaceItem): string {
  const content = ws.doc?.content;
  if (content && typeof content === "object" && "markdown" in content) {
    const md = (content as { markdown?: unknown }).markdown;
    if (typeof md === "string" && md.trim().length > 0) {
      return md;
    }
  }
  return MOCK_RFC_MARKDOWN;
}

export function WorkspaceRoom({ initialWorkspace }: WorkspaceRoomProps) {
  const [workspace, setWorkspace] = useState<WorkspaceItem>(initialWorkspace);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);

  const initialContent = useMemo(
    () => getInitialMarkdown(initialWorkspace),
    [initialWorkspace]
  );
  const [markdown, setMarkdown] = useState<string>(initialContent);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(initialContent);

  // Debounced background auto-save (1000ms delay)
  const handleMarkdownChange = useCallback(
    (newContent: string) => {
      setMarkdown(newContent);
      if (newContent === lastSavedRef.current) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await saveDocMarkdown(workspace.id, newContent);
          if (res.success) {
            lastSavedRef.current = newContent;
          }
        } catch {
          // Silent fallback
        }
      }, 1000);
    },
    [workspace.id]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

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
          key={`${outlineOpen}-${aiOpen}`}
          direction="horizontal"
          className="h-full w-full"
        >
          {/* Left: Dynamic Markdown Outline Panel (~20%) */}
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
                  documentTitle={workspace.name}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Main Markdown Document Workbench (~60%) */}
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
              markdownContent={markdown}
              onMarkdownChange={handleMarkdownChange}
            />
          </ResizablePanel>

          {/* Right: Resizable Copilot Assistant Sidebar (~20%) */}
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
