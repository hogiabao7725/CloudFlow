"use client";

import { ChevronDown, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MOCK_USERS = [
  { id: "1", name: "Bao Ho", role: "Owner", color: "#22C55E" },
  { id: "2", name: "Alex Rivera", role: "Architect", color: "#0EA5E9" },
  { id: "3", name: "Sarah Chen", role: "Tech Lead", color: "#A855F7" },
];

export function WorkspacePresence() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card hover:bg-secondary text-xs font-medium cursor-pointer"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>3 Active</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-56 p-2 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground font-semibold border-b border-border/60 mb-1">
          <Users className="size-3.5" />
          <span>Active Collaborators</span>
        </div>

        <div className="space-y-1">
          {MOCK_USERS.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-secondary/60"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{user.role}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
