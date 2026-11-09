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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2 rounded-2xl border border-border/70 bg-card/40">
      {/* Search and status filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        <div className="relative flex-1 min-w-60 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search initiatives by name, tech or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-10 pr-4 bg-background/80 border-border text-foreground text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? "bg-secondary text-foreground shadow-sm shadow-black/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* View mode toggle and create button */}
      <div className="flex items-center gap-3 self-end lg:self-center">
        <div className="flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange("board")}
            aria-label="Kanban board view"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === "board"
                ? "bg-secondary text-foreground shadow-sm shadow-black/20"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === "list"
                ? "bg-secondary text-foreground shadow-sm shadow-black/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-3.5" />
            <span>List</span>
          </button>
        </div>

        <Button
          onClick={onOpenCreateModal}
          size="lg"
          className="h-10 px-5 gap-2 font-bold shadow-lg shadow-black/25 text-sm"
        >
          <Plus className="size-4" />
          <span>New workspace</span>
        </Button>
      </div>
    </div>
  );
}
