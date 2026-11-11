import { Search, Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KanbanToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: "board" | "list";
  onViewModeChange: (mode: "board" | "list") => void;
  onOpenCreateModal: () => void;
}

const STATUS_FILTERS = ["ALL", "PLANNING", "IN_PROGRESS", "DONE"];

/**
 * Filter controls, search bar, view mode switch, and primary creation button.
 */
export function KanbanToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
}: KanbanToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-1.5 rounded-lg border border-border/70 bg-card/40">
      {/* Search and status filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative flex-1 min-w-60 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search initiatives by name, tech or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9 pr-3 rounded-md bg-background/80 border-border text-foreground text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-0.5 bg-background/80 border border-border p-0.5 rounded-md">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-secondary text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* View mode toggle and create button */}
      <div className="flex items-center gap-2.5 self-end lg:self-center">
        <div className="flex items-center gap-0.5 bg-background/80 border border-border p-0.5 rounded-md">
          <button
            type="button"
            onClick={() => onViewModeChange("board")}
            aria-label="Kanban board view"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === "board"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label="List table view"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-secondary text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-3.5" />
            <span>List</span>
          </button>
        </div>

        <Button
          onClick={onOpenCreateModal}
          size="sm"
          className="h-9 px-3.5 gap-1.5 font-semibold text-xs rounded-md shadow-sm"
        >
          <Plus className="size-4" />
          <span>New workspace</span>
        </Button>
      </div>
    </div>
  );
}
