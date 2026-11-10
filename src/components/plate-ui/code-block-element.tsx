"use client";

import * as React from "react";
import { PlateElement, type PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

export function CodeBlockElement({
  className,
  ...props
}: PlateElementProps) {
  return (
    <PlateElement
      as="pre"
      className={cn(
        "my-4 p-4 rounded-lg border border-border bg-card/60 font-mono text-sm text-foreground/90 overflow-x-auto whitespace-pre-wrap leading-relaxed",
        className
      )}
      {...props}
    >
      <code>{props.children}</code>
    </PlateElement>
  );
}
