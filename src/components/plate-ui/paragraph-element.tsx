"use client";

import * as React from "react";
import { PlateElement, type PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

export function ParagraphElement({
  className,
  ...props
}: PlateElementProps) {
  return (
    <PlateElement
      as="p"
      className={cn("my-3 text-base sm:text-[17px] leading-relaxed text-foreground/90", className)}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}
