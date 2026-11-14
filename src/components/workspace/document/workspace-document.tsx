"use client";

import { useState, isValidElement } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { WorkspaceItem } from "@/types/workspace";
import { MOCK_RFC_MARKDOWN } from "@/mock/workspace-spec-mock";
import { DocumentToolbar, type ViewMode } from "./document-toolbar";
import { DocumentCodeBlock } from "./document-code-block";

interface WorkspaceDocumentProps {
  workspace: WorkspaceItem;
  markdownContent?: string;
  onMarkdownChange?: (newContent: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

function extractText(node: ReactNode): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function toSlug(children: ReactNode): string {
  const text = extractText(children);
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return `sec-${slug}`;
}

export function WorkspaceDocument({
  workspace,
  markdownContent,
  onMarkdownChange,
  onSave,
  isSaving = false,
  isSaved = true,
}: WorkspaceDocumentProps) {
  const [localContent, setLocalContent] = useState(MOCK_RFC_MARKDOWN);
  const isControlled = markdownContent !== undefined;
  const content = isControlled ? markdownContent : localContent;
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  const handleContentChange = (val: string) => {
    if (!isControlled) {
      setLocalContent(val);
    }
    onMarkdownChange?.(val);
  };

  const handleInsertSnippet = (prefix: string, suffix = "") => {
    handleContentChange(content + `\n${prefix}Content${suffix}\n`);
  };

  return (
    <main className="flex-1 h-full overflow-hidden flex flex-col bg-background">
      {/* Sub-Header & Toolbar */}
      <DocumentToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSave={onSave}
        isSaving={isSaving}
        isSaved={isSaved}
        onInsertSnippet={handleInsertSnippet}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* RAW / EDITOR PANE */}
        {(viewMode === "raw" || viewMode === "split") && (
          <div
            className={`h-full overflow-y-auto bg-card/10 ${
              viewMode === "split"
                ? "w-1/2 p-6 border-r border-border/80"
                : "w-full max-w-6xl mx-auto p-6 sm:px-10 lg:px-12"
            }`}
          >
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your specification in markdown..."
              className="w-full h-full min-h-[500px] resize-none bg-transparent outline-none font-mono text-[13.5px] sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </div>
        )}

        {/* PREVIEW PANE */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`h-full overflow-y-auto py-6 scroll-smooth ${
              viewMode === "split"
                ? "w-1/2 px-6 sm:px-8"
                : "w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-12"
            }`}
          >
            {/* Document Header Meta */}
            <div className="border-b border-border/80 pb-3 mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {workspace.name}
              </h1>
            </div>

            {/* Markdown Content Output */}
            <div className="space-y-3.5 pb-20">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1
                      id={toSlug(children)}
                      className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2 mt-7 mb-3.5 scroll-mt-6"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      id={toSlug(children)}
                      className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border/40 pb-1 mt-6 mb-2.5 scroll-mt-6"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      id={toSlug(children)}
                      className="text-base sm:text-lg font-semibold tracking-tight text-foreground mt-5 mb-2 scroll-mt-6"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4
                      id={toSlug(children)}
                      className="text-sm sm:text-base font-semibold text-foreground/90 mt-4 mb-1.5 scroll-mt-6"
                      {...props}
                    >
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-[15px] sm:text-[15.5px] text-foreground/90 leading-relaxed my-2.5">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-5 my-2.5 space-y-1 text-[15px] sm:text-[15.5px] text-foreground/90">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-5 my-2.5 space-y-1 text-[15px] sm:text-[15.5px] text-foreground/90">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-sky-400 bg-sky-500/5 px-3.5 py-2 my-3.5 rounded-r-md text-[13.5px] sm:text-[14px] italic text-foreground/90">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-border/60 my-5" />,
                  table: ({ children }) => (
                    <div className="my-3.5 overflow-x-auto rounded-lg border border-border/80">
                      <table className="w-full text-xs sm:text-[13.5px] text-left border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-secondary/70 p-2.5 font-semibold text-foreground border-b border-border text-[11px] sm:text-xs uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="p-2.5 border-b border-border/50 text-foreground/90 font-mono text-xs sm:text-[13.5px]">
                      {children}
                    </td>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const hasHljs = className?.includes("hljs");
                    const textContent = extractText(children);
                    const isInline =
                      !hasHljs && !match && !textContent.includes("\n");

                    if (isInline) {
                      return (
                        <code
                          className="bg-secondary/70 px-1.5 py-0.5 rounded text-xs sm:text-[13.5px] font-mono text-zinc-200 border border-border/60"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const rawCode = textContent.replace(/\n$/, "");
                    const lang = match ? match[1] : "plaintext";
                    const displayLabel =
                      lang === "plaintext" || lang === "text"
                        ? "architecture flow"
                        : lang;

                    return (
                      <DocumentCodeBlock
                        displayLabel={displayLabel}
                        rawCode={rawCode}
                        className={className}
                      >
                        {children}
                      </DocumentCodeBlock>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
