"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GitHubPrInfo } from "@/types/workspace";
import { WorkspaceGitHubPr } from "./workspace-github-pr";

export interface OutlineItem {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
}

export function extractHeadingsFromMarkdown(markdown: string): OutlineItem[] {
  if (!markdown || !markdown.trim()) return [];
  const lines = markdown.split("\n");
  const items: OutlineItem[] = [];

  for (const line of lines) {
    // Only capture top 4 heading levels (#, ##, ###, ####)
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 1 | 2 | 3 | 4;
      const rawTitle = match[2].trim();
      // Generate clean anchor id: e.g. "sec-1-problem-statement"
      const slug = rawTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const id = slug ? `sec-${slug}` : `heading-${items.length}`;

      items.push({
        id,
        title: rawTitle,
        level,
      });
    }
  }

  return items;
}

interface WorkspaceOutlineProps {
  open: boolean;
  onClose: () => void;
  items: OutlineItem[];
  activeId?: string;
  onSelectItem: (id: string) => void;
  documentTitle?: string;
  isSaved?: boolean;
  workspaceId?: string;
  githubPr?: GitHubPrInfo | null;
  onPrUpdated?: (pr: GitHubPrInfo | null) => void;
}

export function WorkspaceOutline({
  open,
  onClose,
  items,
  activeId,
  onSelectItem,
  workspaceId,
  githubPr,
  onPrUpdated,
}: WorkspaceOutlineProps) {
  if (!open) return null;

  return (
    <aside className="w-full h-full bg-card/30 flex flex-col select-none overflow-hidden border-r border-border/70">
      {/* Header - Clean Title Case, consistent with Studio panels */}
      <div className="flex items-center justify-between h-11 px-3.5 border-b border-border/70 shrink-0 bg-card/40">
        <span className="text-sm font-semibold text-foreground tracking-normal">
          Document Outline
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Close Outline"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Hierarchical sections list with '-' prefix and progressive font sizes & contrast */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No headings found in markdown.
          </div>
        ) : (
          items.map((item) => {
            const level = item.level;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`w-full text-left rounded-md transition-colors truncate cursor-pointer flex items-center ${
                  level === 1
                    ? "mt-3 first:mt-0 py-1.5 px-2 font-semibold text-foreground text-sm tracking-tight"
                    : level === 2
                    ? "py-1 pl-4 pr-2 text-[13px] font-medium text-zinc-300 hover:text-white"
                    : level === 3
                    ? "py-0.5 pl-7 pr-2 text-xs font-normal text-zinc-400 hover:text-zinc-200"
                    : "py-0.5 pl-10 pr-2 text-[11px] font-normal text-zinc-500 hover:text-zinc-300"
                } ${
                  isActive
                    ? "bg-secondary text-foreground font-medium border border-border/70"
                    : "hover:bg-secondary/40"
                }`}
                title={item.title}
              >
                {level > 1 && (
                  <span
                    className={`font-mono mr-2 select-none shrink-0 font-normal ${
                      level === 2
                        ? "text-zinc-500"
                        : level === 3
                        ? "text-zinc-600"
                        : "text-zinc-700"
                    }`}
                  >
                    -
                  </span>
                )}
                <span className="truncate">{item.title}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Bottom: GitHub PR & CI Status Integration */}
      {workspaceId && (
        <WorkspaceGitHubPr
          workspaceId={workspaceId}
          githubPr={githubPr}
          onPrUpdated={onPrUpdated}
        />
      )}
    </aside>
  );
}
