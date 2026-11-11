"use client";

import { useState, useRef, useEffect } from "react";
import {
  GitPullRequest,
  GitPullRequestClosed,
  GitMerge,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { GitHubPrInfo } from "@/types/workspace";
import {
  linkWorkspaceGitHubPr,
  refreshWorkspaceGitHubPr,
  unlinkWorkspaceGitHubPr,
} from "@/actions/workspace";
import { MOCK_GITHUB_PR } from "@/mock/workspace-spec-mock";

interface WorkspaceGitHubPrProps {
  workspaceId: string;
  githubPr?: GitHubPrInfo | null;
  onPrUpdated?: (pr: GitHubPrInfo | null) => void;
}

export function WorkspaceGitHubPr({
  workspaceId,
  githubPr,
  onPrUpdated,
}: WorkspaceGitHubPrProps) {
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputActive) {
      inputRef.current?.focus();
    }
  }, [isInputActive]);

  const handleLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    setIsPending(true);
    try {
      const res = await linkWorkspaceGitHubPr(workspaceId, trimmed);
      if (res.success && res.githubPr) {
        onPrUpdated?.(res.githubPr);
        setInputVal("");
        setIsInputActive(false);
        toast.success(`Attached PR #${res.githubPr.number}`);
      } else {
        toast.error(res.error || "Failed to link PR");
      }
    } catch {
      toast.error("Network error while linking PR");
    } finally {
      setIsPending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshWorkspaceGitHubPr(workspaceId);
      if (res.success && res.githubPr) {
        onPrUpdated?.(res.githubPr);
        toast.success(`CI: ${res.githubPr.ciStatus?.toUpperCase() || "OK"}`);
      } else {
        toast.error(res.error || "Failed to sync status");
      }
    } catch {
      toast.error("Failed to sync status");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUnlink = async () => {
    setIsPending(true);
    try {
      const res = await unlinkWorkspaceGitHubPr(workspaceId);
      if (res.success) {
        onPrUpdated?.(null);
        toast.info("Unlinked pull request");
      } else {
        toast.error(res.error || "Failed to unlink PR");
      }
    } catch {
      toast.error("Failed to unlink PR");
    } finally {
      setIsPending(false);
    }
  };

  // Resolve PR lifecycle state (Merged, Closed, Open)
  const getPrLifecycle = () => {
    if (!githubPr) return null;
    if (githubPr.merged) {
      return { label: "Merged", color: "text-purple-400", Icon: GitMerge };
    }
    if (githubPr.state === "closed") {
      return { label: "Closed", color: "text-rose-400", Icon: GitPullRequestClosed };
    }
    return { label: "Open", color: "text-emerald-400", Icon: GitPullRequest };
  };

  const lifecycle = getPrLifecycle();

  // Render CI check status indicator (Passed, Failed, Running)
  const renderCiIndicator = () => {
    if (!githubPr?.ciStatus || githubPr.ciStatus === "none") return null;
    switch (githubPr.ciStatus) {
      case "passed":
        return (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Passed</span>
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-400">
            <XCircle className="size-4 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      case "running":
        return (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
            <Loader2 className="size-4 animate-spin text-amber-400" />
            <span>Running</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-t border-border/70 bg-card/20 select-none">
      {/* Header bar matching Document Outline typography and height */}
      <div className="group/header flex items-center justify-between h-11 px-3.5 border-b border-border/70 shrink-0 bg-card/40">
        <span className="text-sm font-semibold text-foreground tracking-normal">
          Pull Request
        </span>

        {githubPr && (
          <div className="flex items-center gap-1 opacity-70 group-hover/header:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="size-7 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              title="Sync status"
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isPending}
              className="size-7 inline-flex items-center justify-center rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors disabled:opacity-50 cursor-pointer"
              title="Unlink"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-3.5">
        {githubPr ? (
          /* STATE A: PR Connected */
          <div className="rounded-lg border border-border/70 bg-card/40 p-3.5 space-y-3">
            {/* PR Title & Open link */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5">
                  {lifecycle && (
                    <lifecycle.Icon
                      className={`size-4.5 shrink-0 ${lifecycle.color}`}
                    />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <a
                    href={githubPr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sm text-foreground hover:underline line-clamp-2 leading-snug block"
                    title={githubPr.title}
                  >
                    {githubPr.title}
                  </a>
                  <span className="text-xs font-mono font-medium text-muted-foreground block">
                    Pull Request #{githubPr.number}
                  </span>
                </div>
              </div>

              <a
                href={githubPr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground p-1 shrink-0 transition-colors"
                title="Open on GitHub"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>

            {/* Author and CI status indicator */}
            <div className="flex items-center justify-between pt-2.5 border-t border-border/50 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {githubPr.author?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={githubPr.author.avatarUrl}
                    alt={githubPr.author.login}
                    className="size-5.5 rounded-full object-cover shrink-0 ring-1 ring-border"
                    title={`Author: ${githubPr.author.login}`}
                  />
                ) : (
                  <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                    {githubPr.author?.login?.[0]?.toUpperCase() || "A"}
                  </span>
                )}
                <span className="font-medium text-foreground text-sm truncate">
                  {githubPr.author?.login || "Author"}
                </span>
              </div>

              <div className="shrink-0">{renderCiIndicator()}</div>
            </div>

            {/* Branch name and PR lifecycle state */}
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <GitBranch className="size-4 shrink-0 text-zinc-400" />
                <span
                  className="font-mono text-sm text-zinc-200 truncate"
                  title={githubPr.branch}
                >
                  {githubPr.branch}
                </span>
              </div>

              {lifecycle && (
                <div
                  className={`flex items-center gap-1.5 text-sm font-semibold shrink-0 ${lifecycle.color}`}
                >
                  <lifecycle.Icon className="size-4 shrink-0" />
                  <span>{lifecycle.label}</span>
                </div>
              )}
            </div>
          </div>
        ) : isInputActive ? (
          /* STATE B: Inline input */
          <form onSubmit={handleLink} className="space-y-2">
            <div className="flex items-center rounded-md border border-border bg-background px-3 py-2 focus-within:border-ring">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="PR URL or #number..."
                disabled={isPending}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="submit"
                  disabled={isPending || !inputVal.trim()}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                  title="Attach PR"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsInputActive(false);
                    setInputVal("");
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Cancel"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              <span>Press Enter to link</span>
              {process.env.NODE_ENV === "development" && (
                <button
                  type="button"
                  onClick={() => onPrUpdated?.(MOCK_GITHUB_PR)}
                  className="hover:underline text-zinc-400 cursor-pointer text-xs"
                >
                  Load Mock PR
                </button>
              )}
            </div>
          </form>
        ) : (
          /* STATE C: Empty trigger */
          <button
            type="button"
            onClick={() => setIsInputActive(true)}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-left cursor-pointer border border-border/50"
          >
            <Plus className="size-4 text-zinc-400" />
            <span className="font-medium text-sm">Link pull request...</span>
          </button>
        )}
      </div>
    </div>
  );
}
