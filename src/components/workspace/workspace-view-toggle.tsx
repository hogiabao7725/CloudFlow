"use client";

import { FileText, Columns2, Network } from "lucide-react";

export type ViewMode = "doc" | "dual" | "canvas";

interface WorkspaceViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Segmented control allowing seamless switching between Doc, Dual, and Canvas view modes.
 * Displays icons + text on desktop, and compact icons on mobile screens.
 */
export function WorkspaceViewToggle({
  viewMode,
  onViewModeChange,
}: WorkspaceViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-background/80 border border-border p-1 rounded-xl">
      {/* Doc only */}
      <button
        type="button"
        onClick={() => onViewModeChange("doc")}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          viewMode === "doc"
            ? "bg-secondary text-foreground shadow-xs shadow-black/20"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Document only mode"
      >
        <FileText className="size-3.5 sm:size-4 text-sky-400" />
        <span className="hidden md:inline">Doc only</span>
      </button>

      {/* Dual View */}
      <button
        type="button"
        onClick={() => onViewModeChange("dual")}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          viewMode === "dual"
            ? "bg-secondary text-foreground shadow-xs shadow-black/20"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Split dual-view mode"
      >
        <Columns2 className="size-3.5 sm:size-4 text-primary" />
        <span className="hidden md:inline">Dual View</span>
      </button>

      {/* Canvas only */}
      <button
        type="button"
        onClick={() => onViewModeChange("canvas")}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          viewMode === "canvas"
            ? "bg-secondary text-foreground shadow-xs shadow-black/20"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Canvas only mode"
      >
        <Network className="size-3.5 sm:size-4 text-indigo-400" />
        <span className="hidden md:inline">Canvas only</span>
      </button>
    </div>
  );
}
