"use client";

import * as React from "react";
import { PlateElement, type PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

const headingVariants = {
  h1: "text-3xl font-bold tracking-tight mt-8 mb-3 border-b border-border/50 pb-2 scroll-mt-6 text-foreground",
  h2: "text-2xl font-bold tracking-tight mt-7 mb-2 border-b border-border/40 pb-1.5 scroll-mt-6 text-foreground",
  h3: "text-lg font-semibold tracking-normal mt-5 mb-1.5 scroll-mt-6 text-foreground",
};

export function HeadingElement({
  className,
  as = "h1",
  attributes,
  ...props
}: PlateElementProps & { as?: "h1" | "h2" | "h3" }) {
  const variant = headingVariants[as] || headingVariants.h1;
  const elementId = (props.element?.id as string) || undefined;

  return (
    <PlateElement
      as={as}
      attributes={{
        ...attributes,
        id: elementId,
      }}
      className={cn(variant, className)}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function Heading1Element(props: PlateElementProps) {
  return <HeadingElement as="h1" {...props} />;
}

export function Heading2Element(props: PlateElementProps) {
  return <HeadingElement as="h2" {...props} />;
}

export function Heading3Element(props: PlateElementProps) {
  return <HeadingElement as="h3" {...props} />;
}
