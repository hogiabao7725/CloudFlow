import { Layers, Workflow, Clock, PauseCircle, CheckCircle2 } from "lucide-react";

interface KanbanMetricsProps {
  metrics: {
    total: number;
    planning: number;
    inProgress: number;
    paused: number;
    done: number;
  };
}

/**
 * Compact single-line KPI metric strip summarizing initiatives across all 4 stages.
 * Clean monochrome cards with colored stage icons (no heavy colored container slop).
 */
export function KanbanMetrics({ metrics }: KanbanMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {/* Total Initiatives */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Layers className="size-4.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground truncate">
            Total Initiatives
          </span>
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight tabular-nums shrink-0">
          {metrics.total}
        </span>
      </div>

      {/* Planning */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock className="size-4.5 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-muted-foreground truncate">
            Planning
          </span>
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight tabular-nums shrink-0">
          {metrics.planning}
        </span>
      </div>

      {/* In Progress */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Workflow className="size-4.5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium text-muted-foreground truncate">
            In Progress
          </span>
        </div>
        <span className="text-lg font-bold text-cyan-400 tracking-tight tabular-nums shrink-0">
          {metrics.inProgress}
        </span>
      </div>

      {/* Paused */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <PauseCircle className="size-4.5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium text-muted-foreground truncate">
            Paused
          </span>
        </div>
        <span className="text-lg font-bold text-amber-400 tracking-tight tabular-nums shrink-0">
          {metrics.paused}
        </span>
      </div>

      {/* Completed */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 shadow-xs col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-muted-foreground truncate">
            Completed
          </span>
        </div>
        <span className="text-lg font-bold text-emerald-400 tracking-tight tabular-nums shrink-0">
          {metrics.done}
        </span>
      </div>
    </div>
  );
}
