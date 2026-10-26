import { redirect } from "next/navigation";
import Link from "next/link";
import { syncUser } from "@/data/user";
import { getWorkspaceById } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";
import { WorkspaceItem } from "@/types/workspace";

interface WorkspaceRoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceRoomPage({ params }: WorkspaceRoomPageProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const { workspace, error } = await getWorkspaceById(id);

  if (error || !workspace) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-foreground">Workspace Unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "The requested workspace could not be found or you do not have permission to view it."}
        </p>
        <Button asChild className="mt-6" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <WorkspaceRoom initialWorkspace={workspace as unknown as WorkspaceItem} />
  );
}
