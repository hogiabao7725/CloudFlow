"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  subscribeToWorkspacePresence,
  type PresenceUser,
} from "@/lib/realtime";
import { getDeterministicColor } from "@/utils/color";

interface WorkspacePresenceProps {
  workspaceId?: string;
}

export function WorkspacePresence({ workspaceId }: WorkspacePresenceProps = {}) {
  const { user, isLoaded } = useUser();
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!isLoaded || !user || !workspaceId) return;

    const currentUser: PresenceUser = {
      id: user.id,
      name:
        user.fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "Anonymous",
      avatar: user.imageUrl,
      color: getDeterministicColor(user.id),
    };

    const unsubscribe = subscribeToWorkspacePresence(
      workspaceId,
      currentUser,
      (users) => {
        setActiveUsers(users);
      },
    );

    return unsubscribe;
  }, [workspaceId, isLoaded, user]);

  const count = Math.max(activeUsers.length, 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card hover:bg-secondary text-xs font-medium cursor-pointer"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>{count} Active</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-56 p-2 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground font-semibold border-b border-border/60 mb-1">
          <Users className="size-3.5" />
          <span>Active Collaborators</span>
        </div>

        <div className="space-y-1">
          {activeUsers.length === 0 ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connecting...</span>
            </div>
          ) : (
            activeUsers.map((u) => {
              const isCurrent = user?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {u.avatar ? (
                      <Image
                        src={u.avatar}
                        alt={u.name}
                        width={20}
                        height={20}
                        unoptimized
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: u.color || "#22C55E" }}
                      />
                    )}
                    <span className="font-medium text-foreground truncate">
                      {u.name}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1 py-0.5 rounded font-mono shrink-0 ml-1">
                      You
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
