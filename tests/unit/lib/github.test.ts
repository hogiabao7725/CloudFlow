import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseGitHubPrInput, fetchGitHubPr } from "@/lib/github";

describe("GitHub Utility Module (src/lib/github.ts)", () => {
  describe("parseGitHubPrInput", () => {
    it("should parse standard GitHub pull request URL", () => {
      const parsed = parseGitHubPrInput(
        "https://github.com/hogiabao7725/CloudFlow/pull/42"
      );
      expect(parsed).toEqual({
        owner: "hogiabao7725",
        repo: "CloudFlow",
        prNumber: 42,
      });
    });

    it("should parse owner/repo#number format", () => {
      const parsed = parseGitHubPrInput("facebook/react#1234");
      expect(parsed).toEqual({
        owner: "facebook",
        repo: "react",
        prNumber: 1234,
      });
    });

    it("should parse plain #number using default repo", () => {
      const parsed = parseGitHubPrInput("#15");
      expect(parsed).toEqual({
        owner: "hogiabao7725",
        repo: "CloudFlow",
        prNumber: 15,
      });
    });

    it("should parse plain digits using custom default repo", () => {
      const parsed = parseGitHubPrInput("99", "acme/corp-app");
      expect(parsed).toEqual({
        owner: "acme",
        repo: "corp-app",
        prNumber: 99,
      });
    });

    it("should return null for invalid inputs", () => {
      expect(parseGitHubPrInput("")).toBeNull();
      expect(parseGitHubPrInput("not a valid pr")).toBeNull();
      expect(parseGitHubPrInput("https://gitlab.com/foo/bar/merge_requests/1")).toBeNull();
    });
  });

  describe("fetchGitHubPr", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return null when GitHub API returns non-200", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await fetchGitHubPr("hogiabao7725", "CloudFlow", 99999);
      expect(result).toBeNull();

      global.fetch = originalFetch;
    });

    it("should fetch PR info and evaluate passing CI check runs", async () => {
      const mockPrData = {
        html_url: "https://github.com/hogiabao7725/CloudFlow/pull/3",
        number: 3,
        title: "feat: RFC specs",
        state: "closed",
        merged: true,
        head: {
          ref: "feat/room-rfc",
          sha: "sha_commit_123",
        },
      };

      const mockChecksData = {
        total_count: 1,
        check_runs: [
          {
            name: "Lint & Build",
            status: "completed",
            conclusion: "success",
          },
        ],
      };

      global.fetch = vi.fn((url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes("/pulls/3")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPrData),
          } as Response);
        }
        if (urlStr.includes("/check-runs")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChecksData),
          } as Response);
        }
        return Promise.resolve({ ok: false } as Response);
      });

      const result = await fetchGitHubPr("hogiabao7725", "CloudFlow", 3);
      expect(result).toEqual({
        url: "https://github.com/hogiabao7725/CloudFlow/pull/3",
        number: 3,
        title: "feat: RFC specs",
        state: "closed",
        merged: true,
        branch: "feat/room-rfc",
        ciStatus: "passed",
      });

      global.fetch = originalFetch;
    });
  });
});
