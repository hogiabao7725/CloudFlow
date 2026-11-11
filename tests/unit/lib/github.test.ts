import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseGitHubPrInput,
  fetchGitHubPr,
  resolvePrState,
  evaluateCiStatus,
  getGitHubHeaders,
} from "@/lib/github";

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

    it("should return null for plain numbers without repository", () => {
      expect(parseGitHubPrInput("#15")).toBeNull();
      expect(parseGitHubPrInput("99")).toBeNull();
    });

    it("should return null for invalid inputs", () => {
      expect(parseGitHubPrInput("")).toBeNull();
      expect(parseGitHubPrInput("not a valid pr")).toBeNull();
      expect(
        parseGitHubPrInput("https://gitlab.com/foo/bar/merge_requests/1")
      ).toBeNull();
    });
  });

  describe("resolvePrState", () => {
    it("should resolve to merged when merged is true", () => {
      expect(resolvePrState({ state: "closed", merged: true })).toBe("merged");
    });

    it("should resolve to merged when merged_at timestamp is present", () => {
      expect(
        resolvePrState({
          state: "closed",
          merged_at: "2026-11-10T12:00:00Z",
        })
      ).toBe("merged");
    });

    it("should resolve to closed when closed and not merged", () => {
      expect(resolvePrState({ state: "closed", merged: false })).toBe("closed");
    });

    it("should resolve to open when open", () => {
      expect(resolvePrState({ state: "open", merged: false })).toBe("open");
    });
  });

  describe("evaluateCiStatus", () => {
    it("should return none for empty runs", () => {
      expect(evaluateCiStatus([])).toBe("none");
    });

    it("should prioritize failed status", () => {
      const status = evaluateCiStatus([
        { status: "completed", conclusion: "success" },
        { status: "completed", conclusion: "failure" },
      ]);
      expect(status).toBe("failed");
    });

    it("should detect running when in progress", () => {
      const status = evaluateCiStatus([
        { status: "in_progress" },
        { status: "completed", conclusion: "success" },
      ]);
      expect(status).toBe("running");
    });

    it("should return passed when all runs succeed", () => {
      const status = evaluateCiStatus([
        { status: "completed", conclusion: "success" },
      ]);
      expect(status).toBe("passed");
    });
  });

  describe("getGitHubHeaders", () => {
    it("should produce valid headers with User-Agent and Accept", () => {
      const headers = getGitHubHeaders();
      expect(headers.Accept).toBe("application/vnd.github+json");
      expect(headers["User-Agent"]).toBe("CloudFlow-DevOps-Platform");
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
          sha: "c741fa6e12345",
        },
        user: {
          login: "hogiabao7725",
          avatar_url: "https://github.com/hogiabao7725.png",
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
        state: "merged",
        branch: "feat/room-rfc",
        ciStatus: "passed",
        author: {
          login: "hogiabao7725",
          avatarUrl: "https://github.com/hogiabao7725.png",
        },
      });

      global.fetch = originalFetch;
    });

    it("should map unmerged closed PR to closed state", async () => {
      const mockPrData = {
        html_url: "https://github.com/hogiabao7725/CloudFlow/pull/5",
        number: 5,
        title: "feat: cancelled feature",
        state: "closed",
        merged: false,
        head: { ref: "feat/cancelled", sha: "sha5" },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPrData),
        } as Response)
      );

      const result = await fetchGitHubPr("hogiabao7725", "CloudFlow", 5);
      expect(result?.state).toBe("closed");

      global.fetch = originalFetch;
    });

    it("should map open PR to open state", async () => {
      const mockPrData = {
        html_url: "https://github.com/hogiabao7725/CloudFlow/pull/6",
        number: 6,
        title: "feat: in-progress work",
        state: "open",
        merged: false,
        head: { ref: "feat/wip", sha: "sha6" },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPrData),
        } as Response)
      );

      const result = await fetchGitHubPr("hogiabao7725", "CloudFlow", 6);
      expect(result?.state).toBe("open");

      global.fetch = originalFetch;
    });
  });
});
