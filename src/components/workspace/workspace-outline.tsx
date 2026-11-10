"use client";

import { ListCollapse, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OutlineItem {
  id: string;
  title: string;
  level?: 1 | 2 | 3;
}

interface WorkspaceOutlineProps {
  open: boolean;
  onClose: () => void;
  items: OutlineItem[];
  activeId?: string;
  onSelectItem: (id: string) => void;
}

export function WorkspaceOutline({
  open,
  onClose,
  items,
  activeId,
  onSelectItem,
}: WorkspaceOutlineProps) {
  if (!open) return null;

  return (
    <aside className="w-full h-full bg-card/30 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between h-11 px-3 border-b border-border/70 text-sm font-semibold text-foreground shrink-0">
        <div className="flex items-center gap-2">
          <ListCollapse className="size-4 text-muted-foreground" />
          <span>Outline</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="size-7 p-0 text-muted-foreground hover:text-foreground"
          title="Close Outline"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Hierarchical list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-2 text-center w-full">
            <p className="font-semibold text-foreground text-sm">No outline headings</p>
            <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed w-full">
              Add headings (H1, H2, H3) in the document to generate your outline structure.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const level = item.level ?? 1;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`w-full text-left rounded-md transition-colors truncate cursor-pointer flex items-center ${
                  level === 1
                    ? "py-2 px-2.5 font-semibold text-foreground text-sm"
                    : level === 2
                    ? "py-1.5 pl-6 pr-2 text-muted-foreground font-medium text-[13px]"
                    : "py-1.5 pl-8 pr-2 text-muted-foreground/80 text-xs"
                } ${
                  isActive
                    ? "bg-secondary text-foreground font-semibold shadow-xs"
                    : "hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {level > 1 && (
                  <span className="inline-block w-2 h-px bg-border/80 mr-1.5 shrink-0" />
                )}
                <span className="truncate">{item.title}</span>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
