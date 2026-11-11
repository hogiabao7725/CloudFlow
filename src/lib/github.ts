import type { GitHubPrInfo } from "@/types/workspace";

export interface ParsedPrInput {
  owner: string;
  repo: string;
  prNumber: number;
}

interface RawCheckRun {
  status?: string;
  conclusion?: string;
}

interface RawGitHubPr {
  html_url: string;
  number: number;
  title: string;
  state: string;
  merged?: boolean;
  merged_at?: string | null;
  head?: { ref?: string; sha?: string };
  user?: { login: string; avatar_url?: string };
}

/**
 * Builds standard GitHub REST API request headers.
 */
export function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CloudFlow-DevOps-Platform",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Parses GitHub PR input: full URL or owner/repo#number format.
 * Returns null if format is invalid or repository is missing.
 */
export function parseGitHubPrInput(input: string): ParsedPrInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Full URL: https://github.com/:owner/:repo/pull/:number
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/i,
  );
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      prNumber: parseInt(urlMatch[3], 10),
    };
  }

  // 2. Short format: owner/repo#number
  const shortMatch = trimmed.match(/^([^/\s]+)\/([^#\s]+)#(\d+)$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
      prNumber: parseInt(shortMatch[3], 10),
    };
  }

  return null;
}

/**
 * Maps raw GitHub PR state into domain lifecycle state (merged, closed, open).
 */
export function resolvePrState(
  prData: Pick<RawGitHubPr, "state" | "merged" | "merged_at">,
): GitHubPrInfo["state"] {
  if (prData.merged || prData.merged_at) {
    return "merged";
  }
  if (prData.state === "closed") {
    return "closed";
  }
  return "open";
}

/**
 * Evaluates CI check runs conclusion into a unified status.
 */
export function evaluateCiStatus(
  runs: RawCheckRun[],
): GitHubPrInfo["ciStatus"] {
  if (!runs || runs.length === 0) return "none";

  const hasFailed = runs.some(
    (r) =>
      r.conclusion === "failure" ||
      r.conclusion === "timed_out" ||
      r.conclusion === "cancelled",
  );
  if (hasFailed) return "failed";

  const hasRunning = runs.some(
    (r) => r.status === "in_progress" || r.status === "queued",
  );
  if (hasRunning) return "running";

  return "passed";
}

/**
 * Fetches CI check runs for a commit SHA.
 */
export async function fetchCiCheckStatus(
  owner: string,
  repo: string,
  sha?: string,
): Promise<GitHubPrInfo["ciStatus"]> {
  if (!sha) return "none";

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/check-runs`,
      { headers: getGitHubHeaders(), next: { revalidate: 30 } },
    );
    if (!res.ok) return "none";

    const data = await res.json();
    const runs = (data?.check_runs as RawCheckRun[]) || [];
    return evaluateCiStatus(runs);
  } catch {
    return "none";
  }
}

/**
 * Fetches pull request information and CI check statuses from the GitHub REST API.
 */
export async function fetchGitHubPr(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<GitHubPrInfo | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: getGitHubHeaders(), next: { revalidate: 30 } },
    );
    if (!res.ok) return null;

    const prData: RawGitHubPr = await res.json();
    const ciStatus = await fetchCiCheckStatus(owner, repo, prData.head?.sha);

    return {
      url: prData.html_url,
      number: prData.number,
      title: prData.title,
      state: resolvePrState(prData),
      branch: prData.head?.ref || "unknown",
      ciStatus,
      ...(prData.user
        ? {
            author: {
              login: prData.user.login,
              avatarUrl: prData.user.avatar_url,
            },
          }
        : {}),
    };
  } catch (err) {
    console.error("Error fetching GitHub PR:", err);
    return null;
  }
}
