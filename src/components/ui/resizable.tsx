"use client";

import * as React from "react";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from "react-resizable-panels";
import { GripVertical } from "lucide-react";

interface ResizablePanelGroupProps extends Omit<GroupProps, "orientation"> {
  direction?: "horizontal" | "vertical";
  orientation?: "horizontal" | "vertical";
}

export function ResizablePanelGroup({
  className = "",
  direction = "horizontal",
  orientation,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <Group
      orientation={orientation || direction}
      className={`flex h-full w-full data-[orientation=vertical]:flex-col ${className}`}
      {...props}
    />
  );
}

export function ResizablePanel({
  className = "",
  ...props
}: PanelProps) {
  return (
    <Panel
      className={`relative flex h-full w-full overflow-hidden ${className}`}
      {...props}
    />
  );
}

interface ResizableHandleProps extends SeparatorProps {
  withHandle?: boolean;
}

export function ResizableHandle({
  withHandle = true,
  className = "",
  ...props
}: ResizableHandleProps) {
  return (
    <Separator
      className={`relative flex w-1.5 items-center justify-center bg-border/40 transition-colors hover:bg-border/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-1 cursor-col-resize data-[orientation=vertical]:cursor-row-resize after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 data-[orientation=vertical]:h-1.5 data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-4 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 ${className}`}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-7 w-3.5 items-center justify-center rounded-sm border border-border/80 bg-card shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary pointer-events-none select-none">
          <GripVertical className="size-2.5 text-muted-foreground/70" />
        </div>
      )}
    </Separator>
  );
}
