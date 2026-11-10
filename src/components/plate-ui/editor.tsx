"use client";

import * as React from "react";
import { PlateContent } from "platejs/react";
import { cn } from "@/lib/utils";

export type EditorProps = React.ComponentProps<typeof PlateContent>;

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          "w-full min-h-[500px] bg-transparent focus:outline-hidden text-foreground selection:bg-cyan-500/20 text-base sm:text-[17px] leading-relaxed placeholder:text-muted-foreground/50",
          className
        )}
        {...props}
      />
    );
  }
);
Editor.displayName = "Editor";
