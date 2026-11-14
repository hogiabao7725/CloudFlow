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
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "CloudFlow-DevOps-Platform",
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  };
}

/**
 * Parses GitHub PR input: full URL or owner/repo#number format.
 */
export function parseGitHubPrInput(input: string): ParsedPrInput | null {
  const str = input.trim();
  const m =
    str.match(/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/i) ||
    str.match(/^([^/\s]+)\/([^#\s]+)#(\d+)$/);

  if (!m) return null;
  return { owner: m[1], repo: m[2], prNumber: parseInt(m[3], 10) };
}

/**
 * Maps raw GitHub PR state into domain lifecycle state (merged, closed, open).
 */
export function resolvePrState(
  prData: Pick<RawGitHubPr, "state" | "merged" | "merged_at">,
): GitHubPrInfo["state"] {
  if (prData.merged || prData.merged_at) return "merged";
  return prData.state === "closed" ? "closed" : "open";
}

/**
 * Evaluates CI check runs conclusion into a unified status.
 */
export function evaluateCiStatus(
  runs: RawCheckRun[],
): GitHubPrInfo["ciStatus"] {
  if (!runs?.length) return "none";
  if (
    runs.some((r) =>
      ["failure", "timed_out", "cancelled"].includes(r.conclusion ?? ""),
    )
  ) {
    return "failed";
  }
  if (runs.some((r) => ["in_progress", "queued"].includes(r.status ?? ""))) {
    return "running";
  }
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
    return evaluateCiStatus(data?.check_runs || []);
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

    const pr: RawGitHubPr = await res.json();
    const ciStatus = await fetchCiCheckStatus(owner, repo, pr.head?.sha);

    return {
      url: pr.html_url,
      number: pr.number,
      title: pr.title,
      state: resolvePrState(pr),
      branch: pr.head?.ref || "unknown",
      ciStatus,
      ...(pr.user && {
        author: { login: pr.user.login, avatarUrl: pr.user.avatar_url },
      }),
    };
  } catch (err) {
    console.error("Error fetching GitHub PR:", err);
    return null;
  }
}
