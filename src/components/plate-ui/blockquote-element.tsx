"use client";

import * as React from "react";
import { PlateElement, type PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

export function BlockquoteElement({
  className,
  ...props
}: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      className={cn(
        "my-4 border-l-2 border-cyan-500/70 pl-4 text-base text-muted-foreground/95 italic",
        className
      )}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}
