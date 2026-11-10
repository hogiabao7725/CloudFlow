"use client";

import { createPlatePlugin, Plate, usePlateEditor } from "platejs/react";
import { WorkspaceItem } from "@/types/workspace";
import { Editor } from "@/components/plate-ui/editor";
import {
  Heading1Element,
  Heading2Element,
  Heading3Element,
} from "@/components/plate-ui/heading-element";
import { ParagraphElement } from "@/components/plate-ui/paragraph-element";
import { CodeBlockElement } from "@/components/plate-ui/code-block-element";
import { BlockquoteElement } from "@/components/plate-ui/blockquote-element";
import { OutlineItem } from "./workspace-outline";

export const platePlugins = [
  createPlatePlugin({
    key: "h1",
    node: { isElement: true, type: "h1", component: Heading1Element },
  }),
  createPlatePlugin({
    key: "h2",
    node: { isElement: true, type: "h2", component: Heading2Element },
  }),
  createPlatePlugin({
    key: "h3",
    node: { isElement: true, type: "h3", component: Heading3Element },
  }),
  createPlatePlugin({
    key: "p",
    node: { isElement: true, type: "p", component: ParagraphElement },
  }),
  createPlatePlugin({
    key: "code_block",
    node: { isElement: true, type: "code_block", component: CodeBlockElement },
  }),
  createPlatePlugin({
    key: "blockquote",
    node: { isElement: true, type: "blockquote", component: BlockquoteElement },
  }),
];

interface PlateNodeChild {
  text?: string;
  [key: string]: unknown;
}

interface PlateNodeItem {
  id?: string;
  type?: string;
  children?: PlateNodeChild[];
  [key: string]: unknown;
}

export function extractHeadings(nodes: unknown[]): OutlineItem[] {
  const items: OutlineItem[] = [];
  if (!Array.isArray(nodes)) return items;

  for (const node of nodes as PlateNodeItem[]) {
    if (node && (node.type === "h1" || node.type === "h2" || node.type === "h3")) {
      const text = (node.children || [])
        .map((c) => c.text || "")
        .join("")
        .trim();

      if (text) {
        items.push({
          id: node.id || `heading-${items.length}`,
          title: text,
          level: node.type === "h1" ? 1 : node.type === "h2" ? 2 : 3,
        });
      }
    }
  }

  return items;
}

export const INITIAL_PLATE_VALUE = [
  {
    type: "p",
    children: [{ text: "" }],
  },
];

interface WorkspaceDocumentProps {
  workspace?: WorkspaceItem;
  onHeadingsChange?: (headings: OutlineItem[]) => void;
}

export function WorkspaceDocument({
  onHeadingsChange,
}: WorkspaceDocumentProps) {
  const editor = usePlateEditor({
    value: INITIAL_PLATE_VALUE,
    plugins: platePlugins,
  });

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background px-6 py-8 sm:px-10 scroll-smooth">
      <div className="w-full pb-24">
        {/* Plate.js Living Editor */}
        <Plate
          editor={editor}
          onValueChange={({ value }) => {
            if (onHeadingsChange) {
              const headings = extractHeadings(value);
              onHeadingsChange(headings);
            }
          }}
        >
          <Editor placeholder="Start typing your architecture specification or headings to structure the outline..." />
        </Plate>
      </div>
    </main>
  );
}
