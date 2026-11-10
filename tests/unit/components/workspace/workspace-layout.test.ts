import { describe, it, expect } from "vitest";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceOutline } from "@/components/workspace/workspace-outline";
import {
  WorkspaceDocument,
  extractHeadings,
  INITIAL_PLATE_VALUE,
  platePlugins,
} from "@/components/workspace/workspace-document";
import { WorkspaceAISidebar } from "@/components/workspace/workspace-ai-sidebar";
import { WorkspacePresence } from "@/components/workspace/workspace-presence";
import { Editor } from "@/components/plate-ui/editor";
import {
  HeadingElement,
  Heading1Element,
  Heading2Element,
  Heading3Element,
} from "@/components/plate-ui/heading-element";
import { ParagraphElement } from "@/components/plate-ui/paragraph-element";
import { CodeBlockElement } from "@/components/plate-ui/code-block-element";
import { BlockquoteElement } from "@/components/plate-ui/blockquote-element";

describe("Workspace Layout Components Contract", () => {
  it("should export WorkspaceHeader as a functional component", () => {
    expect(typeof WorkspaceHeader).toBe("function");
  });

  it("should export WorkspaceOutline as a functional component", () => {
    expect(typeof WorkspaceOutline).toBe("function");
  });

  it("should export WorkspaceDocument as a functional component", () => {
    expect(typeof WorkspaceDocument).toBe("function");
  });

  it("should export WorkspaceAISidebar as a functional component", () => {
    expect(typeof WorkspaceAISidebar).toBe("function");
  });

  it("should export WorkspacePresence as a functional component", () => {
    expect(typeof WorkspacePresence).toBe("function");
  });

  it("should export Plate UI components", () => {
    expect(Editor).toBeDefined();
    expect(typeof HeadingElement).toBe("function");
    expect(typeof Heading1Element).toBe("function");
    expect(typeof Heading2Element).toBe("function");
    expect(typeof Heading3Element).toBe("function");
    expect(typeof ParagraphElement).toBe("function");
    expect(typeof CodeBlockElement).toBe("function");
    expect(typeof BlockquoteElement).toBe("function");
  });

  it("should include core element plugins", () => {
    expect(Array.isArray(platePlugins)).toBe(true);
    expect(platePlugins.length).toBe(6);
  });

  it("should initialize with an empty document value", () => {
    expect(INITIAL_PLATE_VALUE).toEqual([
      {
        type: "p",
        children: [{ text: "" }],
      },
    ]);
    expect(extractHeadings(INITIAL_PLATE_VALUE)).toEqual([]);
  });

  it("should extract hierarchical headings from Plate document nodes", () => {
    const sampleNodes = [
      {
        type: "h1",
        id: "sec-problem",
        children: [{ text: "1. Problem Statement" }],
      },
      {
        type: "h2",
        id: "sec-bottlenecks",
        children: [{ text: "Background & Bottlenecks" }],
      },
      {
        type: "p",
        children: [{ text: "Description text" }],
      },
      {
        type: "h3",
        id: "sec-details",
        children: [{ text: "Specific Detail" }],
      },
    ];

    const headings = extractHeadings(sampleNodes);
    expect(headings.length).toBe(3);
    expect(headings[0]).toEqual({
      id: "sec-problem",
      title: "1. Problem Statement",
      level: 1,
    });
    expect(headings[1]).toEqual({
      id: "sec-bottlenecks",
      title: "Background & Bottlenecks",
      level: 2,
    });
    expect(headings[2]).toEqual({
      id: "sec-details",
      title: "Specific Detail",
      level: 3,
    });
  });

  it("should gracefully handle empty or invalid nodes array", () => {
    expect(extractHeadings([])).toEqual([]);
    expect(extractHeadings(null as unknown as unknown[])).toEqual([]);
  });
});
