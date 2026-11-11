import type { GitHubPrInfo } from "@/types/workspace";

export const DEFAULT_GITHUB_REPO = "hogiabao7725/CloudFlow";

export interface ParsedPrInput {
  owner: string;
  repo: string;
  prNumber: number;
}

/**
 * Parses a GitHub PR input string (URL, owner/repo#number, or #number).
 */
export function parseGitHubPrInput(
  input: string,
  defaultRepo: string = DEFAULT_GITHUB_REPO
): ParsedPrInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match full GitHub PR URL: https://github.com/:owner/:repo/pull/:number
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      prNumber: parseInt(urlMatch[3], 10),
    };
  }

  // Match owner/repo#number
  const repoPrMatch = trimmed.match(/^([^/\s]+)\/([^#\s]+)#(\d+)$/);
  if (repoPrMatch) {
    return {
      owner: repoPrMatch[1],
      repo: repoPrMatch[2],
      prNumber: parseInt(repoPrMatch[3], 10),
    };
  }

  // Match #number or plain number
  const numMatch = trimmed.match(/^#?(\d+)$/);
  if (numMatch) {
    const [owner, repo] = defaultRepo.split("/");
    return {
      owner: owner || "hogiabao7725",
      repo: repo || "CloudFlow",
      prNumber: parseInt(numMatch[1], 10),
    };
  }

  return null;
}

/**
 * Fetches pull request information and CI check statuses from the GitHub REST API.
 */
export async function fetchGitHubPr(
  owner: string,
  repo: string,
  prNumber: number
): Promise<GitHubPrInfo | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "CloudFlow-DevOps-Platform",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const prRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers, next: { revalidate: 30 } }
    );

    if (!prRes.ok) {
      return null;
    }

    const prData = await prRes.json();
    const headSha = prData?.head?.sha;

    let ciStatus: GitHubPrInfo["ciStatus"] = "none";

    if (headSha) {
      const checksRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${headSha}/check-runs`,
        { headers, next: { revalidate: 30 } }
      );

      if (checksRes.ok) {
        const checksData = await checksRes.json();
        const runs = (checksData?.check_runs as Array<{ status?: string; conclusion?: string }>) || [];

        if (runs.length > 0) {
          const hasFailed = runs.some(
            (r) =>
              r.conclusion === "failure" ||
              r.conclusion === "timed_out" ||
              r.conclusion === "cancelled"
          );
          const hasRunning = runs.some(
            (r) => r.status === "in_progress" || r.status === "queued"
          );

          if (hasFailed) {
            ciStatus = "failed";
          } else if (hasRunning) {
            ciStatus = "running";
          } else {
            ciStatus = "passed";
          }
        }
      }
    }

    return {
      url: prData.html_url,
      number: prData.number,
      title: prData.title,
      state: prData.state,
      merged: Boolean(prData.merged || prData.merged_at),
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
