"use client";

import { useState } from "react";
import { WorkspaceStatus } from "@prisma/client";
import { ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { updateWorkspaceStatus } from "@/actions/workspace";
import { WorkspaceItem } from "@/types/workspace";

interface WorkspaceStatusSelectProps {
  workspace: WorkspaceItem;
  onWorkspaceUpdated?: (updated: Partial<WorkspaceItem>) => void;
}

const STATUS_CONFIG: Record<
  WorkspaceStatus,
  { label: string; dotColor: string; bg: string }
> = {
  [WorkspaceStatus.PLANNING]: {
    label: "Planning",
    dotColor: "bg-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20 text-slate-300",
  },
  [WorkspaceStatus.IN_PROGRESS]: {
    label: "In Progress",
    dotColor: "bg-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  },
  [WorkspaceStatus.PAUSED]: {
    label: "Paused",
    dotColor: "bg-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  },
  [WorkspaceStatus.DONE]: {
    label: "Done",
    dotColor: "bg-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  },
};

/**
 * Interactive status dropdown pill allowing quick stage changes from the header.
 */
export function WorkspaceStatusSelect({
  workspace,
  onWorkspaceUpdated,
}: WorkspaceStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WorkspaceStatus>(
    workspace.status
  );

  const statusInfo =
    STATUS_CONFIG[currentStatus] || STATUS_CONFIG[WorkspaceStatus.PLANNING];

  const handleStatusChange = async (newStatus: WorkspaceStatus) => {
    setIsOpen(false);
    if (newStatus === currentStatus) return;

    const prev = currentStatus;
    setCurrentStatus(newStatus);

    try {
      const res = await updateWorkspaceStatus(
        workspace.id,
        newStatus,
        workspace.position
      );
      if (!res.success) {
        toast.error("Failed to update status");
        setCurrentStatus(prev);
      } else {
        toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
        onWorkspaceUpdated?.({ status: newStatus });
      }
    } catch {
      toast.error("Failed to update status");
      setCurrentStatus(prev);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${statusInfo.bg}`}
      >
        <span className={`size-2 rounded-full ${statusInfo.dotColor}`} />
        <span>{statusInfo.label}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/40 text-xs sm:text-sm">
            {(Object.keys(STATUS_CONFIG) as WorkspaceStatus[]).map((st) => {
              const cfg = STATUS_CONFIG[st];
              const isCurrent = st === currentStatus;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                    isCurrent
                      ? "bg-secondary text-foreground font-bold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${cfg.dotColor}`} />
                    <span>{cfg.label}</span>
                  </div>
                  {isCurrent && <Check className="size-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
