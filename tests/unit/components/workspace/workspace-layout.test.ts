import { describe, it, expect } from "vitest";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import {
  WorkspaceOutline,
  extractHeadingsFromMarkdown,
} from "@/components/workspace/workspace-outline";
import { WorkspaceDocument } from "@/components/workspace/workspace-document";
import { WorkspaceAISidebar } from "@/components/workspace/workspace-ai-sidebar";
import { WorkspacePresence } from "@/components/workspace/workspace-presence";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";
import { WorkspaceGitHubPr } from "@/components/workspace/workspace-github-pr";
import { MOCK_RFC_MARKDOWN, MOCK_GITHUB_PR } from "@/mock/workspace-spec-mock";

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

  it("should export WorkspaceRoom as a functional component", () => {
    expect(typeof WorkspaceRoom).toBe("function");
  });

  it("should export WorkspaceGitHubPr as a functional component", () => {
    expect(typeof WorkspaceGitHubPr).toBe("function");
  });
});

describe("Markdown Outline Extraction Engine", () => {
  it("should return an empty array for empty or falsy markdown input", () => {
    expect(extractHeadingsFromMarkdown("")).toEqual([]);
    expect(extractHeadingsFromMarkdown("   \n\n  ")).toEqual([]);
  });

  it("should extract H1, H2, and H3 headings with correct hierarchical levels", () => {
    const markdown = `# Architecture Overview
Some intro text explaining the system.

## Database Schema
Details about Supabase PostgreSQL.

### Index Strategy
Composite indexes for high throughput.

## API Gateway
Edge runtime functions.`;

    const headings = extractHeadingsFromMarkdown(markdown);

    expect(headings).toHaveLength(4);
    expect(headings[0]).toEqual({
      id: "sec-architecture-overview",
      title: "Architecture Overview",
      level: 1,
    });
    expect(headings[1]).toEqual({
      id: "sec-database-schema",
      title: "Database Schema",
      level: 2,
    });
    expect(headings[2]).toEqual({
      id: "sec-index-strategy",
      title: "Index Strategy",
      level: 3,
    });
    expect(headings[3]).toEqual({
      id: "sec-api-gateway",
      title: "API Gateway",
      level: 2,
    });
  });

  it("should extract top 4 heading levels (H1, H2, H3, H4) and ignore H5+", () => {
    const markdown = `# Level 1
## Level 2
### Level 3
#### Level 4
##### Level 5`;
    const headings = extractHeadingsFromMarkdown(markdown);
    expect(headings).toHaveLength(4);
    expect(headings.map((h) => h.level)).toEqual([1, 2, 3, 4]);
  });

  it("should ignore standard paragraphs, lists, and code blocks", () => {
    const markdown = `
Just a normal paragraph without any heading.
- List item 1
- List item 2
\`\`\`sql
-- SQL Comment with # symbol is not markdown heading
SELECT * FROM users;
\`\`\`
> Blockquote text
`;

    const headings = extractHeadingsFromMarkdown(markdown);
    expect(headings).toHaveLength(0);
  });

  it("should sanitize special characters in heading titles when generating IDs", () => {
    const markdown = `## 3. PostgreSQL Migration (Additive & Non-destructive)`;
    const headings = extractHeadingsFromMarkdown(markdown);

    expect(headings).toHaveLength(1);
    expect(headings[0].id).toBe("sec-3-postgresql-migration-additive-non-destructive");
    expect(headings[0].title).toBe("3. PostgreSQL Migration (Additive & Non-destructive)");
  });
});

describe("Workspace Spec Mock Data Contract", () => {
  it("should export authentic RFC specification markdown with required cloud engineering sections", () => {
    expect(typeof MOCK_RFC_MARKDOWN).toBe("string");
    expect(MOCK_RFC_MARKDOWN.length).toBeGreaterThan(500);

    // Verify key cloud architecture sections exist
    expect(MOCK_RFC_MARKDOWN).toContain("# 1. Problem Statement");
    expect(MOCK_RFC_MARKDOWN).toContain("# 2. Proposed Cloud Architecture Flow");
    expect(MOCK_RFC_MARKDOWN).toContain("# 3. Database Schema Migration");
    expect(MOCK_RFC_MARKDOWN).toContain("# 4. Implementation Code");
    expect(MOCK_RFC_MARKDOWN).toContain("# 5. Non-Functional Requirements (NFR)");
    expect(MOCK_RFC_MARKDOWN).toContain("# 6. Security & Tenant Isolation");
  });

  it("should export authentic GitHub PR mock data for quick preview and offline testing", () => {
    expect(MOCK_GITHUB_PR).toBeDefined();
    expect(MOCK_GITHUB_PR.number).toBe(4);
    expect(MOCK_GITHUB_PR.branch).toBe("review/phase-2");
    expect(MOCK_GITHUB_PR.state).toBe("merged");
    expect(MOCK_GITHUB_PR.ciStatus).toBe("passed");
    expect(MOCK_GITHUB_PR.author.login).toBe("hogiabao7725");
    expect(MOCK_GITHUB_PR.author.avatarUrl).toBe("https://github.com/hogiabao7725.png");
    expect(MOCK_GITHUB_PR.url).toContain("github.com/hogiabao7725/CloudFlow/pull/4");
    expect(typeof MOCK_GITHUB_PR.title).toBe("string");
  });
});
