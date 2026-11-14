"use client";

import {
  Eye,
  Code2,
  Columns3,
  Heading2,
  Bold,
  Italic,
  List,
  Table as TableIcon,
} from "lucide-react";

export type ViewMode = "preview" | "raw" | "split";

interface DocumentToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSave?: () => void;
  isSaving: boolean;
  isSaved: boolean;
  onInsertSnippet: (prefix: string, suffix?: string) => void;
}

export function DocumentToolbar({
  viewMode,
  onViewModeChange,
  onSave,
  isSaving,
  isSaved,
  onInsertSnippet,
}: DocumentToolbarProps) {
  return (
    <>
      {/* Top View Mode & Save Bar */}
      <div className="h-11 px-4 border-b border-border/80 bg-card/40 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewModeChange("preview")}
            className={`px-2.5 py-1 rounded text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "preview"
                ? "bg-secondary text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3.5 text-sky-400" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("raw")}
            className={`px-2.5 py-1 rounded text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "raw"
                ? "bg-secondary text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-3.5 text-amber-400" />
            <span>Raw Markdown</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("split")}
            className={`hidden lg:flex px-2.5 py-1 rounded text-[13px] font-medium items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === "split"
                ? "bg-secondary text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Columns3 className="size-3.5 text-emerald-400" />
            <span>Split View</span>
          </button>
        </div>

        {onSave && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {isSaving ? "Saving..." : isSaved ? "Saved" : "Unsaved changes"}
            </span>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || isSaved}
              className="h-7 px-3 rounded text-xs font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Formatting Quick-Toolbar (When in Raw or Split mode) */}
      {(viewMode === "raw" || viewMode === "split") && (
        <div className="h-8 px-4 border-b border-border/60 bg-card/20 flex items-center gap-1 text-xs shrink-0 select-none overflow-x-auto">
          <button
            type="button"
            onClick={() => onInsertSnippet("## ")}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onInsertSnippet("**", "**")}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Bold"
          >
            <Bold className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onInsertSnippet("*", "*")}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Italic"
          >
            <Italic className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onInsertSnippet("- ")}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Bullet List"
          >
            <List className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onInsertSnippet("```typescript\n", "\n```")}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Code Block"
          >
            <Code2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              onInsertSnippet(
                "| Header 1 | Header 2 |\n| :--- | :--- |\n| Row 1 | Value 1 |",
              )
            }
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded cursor-pointer"
            title="Table"
          >
            <TableIcon className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
