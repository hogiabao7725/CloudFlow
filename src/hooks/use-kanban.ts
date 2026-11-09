import { useState, useMemo } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { toast } from "sonner";
import { WorkspaceItem } from "@/types/workspace";
import {
  updateWorkspaceStatus,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspace";

/**
 * Encapsulates state, filtering, Drag-and-Drop calculation, and server actions
 * for the Kanban architecture dashboard.
 */
export function useKanban(initialWorkspaces: WorkspaceItem[]) {
  const [workspaces, setWorkspaces] =
    useState<WorkspaceItem[]>(initialWorkspaces);
  const [prevInitial, setPrevInitial] = useState(initialWorkspaces);

  // Sync state if initialWorkspaces prop updates from server
  if (prevInitial !== initialWorkspaces) {
    setPrevInitial(initialWorkspaces);
    setWorkspaces(initialWorkspaces);
  }

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Real-time metrics
  const metrics = useMemo(() => calculateMetrics(workspaces), [workspaces]);

  // Workspaces filtered by search query and stage
  const filteredWorkspaces = useMemo(
    () => filterWorkspaces(workspaces, search, statusFilter),
    [workspaces, search, statusFilter],
  );

  // Insert newly created workspace into local state
  const handleCreated = (newWorkspace: WorkspaceItem) => {
    setWorkspaces((prev) => [...prev, newWorkspace]);
  };

  // Rename workspace with server persistence and state update
  const handleRename = async (
    id: string,
    newName: string,
  ): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    try {
      const res = await updateWorkspace(id, { name: trimmed });
      if (!res.success) {
        toast.error(res.error || "Failed to rename workspace");
        return false;
      }

      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: trimmed } : w)),
      );
      toast.success("Workspace renamed");
      return true;
    } catch {
      toast.error("Failed to rename workspace");
      return false;
    }
  };

  // Delete workspace with server persistence and state removal
  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const res = await deleteWorkspace(id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete workspace");
        return false;
      }

      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workspace deleted");
      return true;
    } catch {
      toast.error("Failed to delete workspace");
      return false;
    }
  };

  // Reorder or transition card between Kanban columns with fractional indexing
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStatus = destination.droppableId as WorkspaceStatus;
    const previousWorkspaces = [...workspaces];
    const movedItem = workspaces.find((w) => w.id === draggableId);
    if (!movedItem) return;

    // Items already in the destination column excluding the moved item
    const destColumnItems = workspaces
      .filter((w) => w.status === destStatus && w.id !== draggableId)
      .sort((a, b) => a.position - b.position);

    // Calculate midpoint position using fractional indexing
    const newPosition = calculateNextPosition(
      destColumnItems,
      destination.index,
    );

    // Optimistic UI update
    const updatedMovedItem: WorkspaceItem = {
      ...movedItem,
      status: destStatus,
      position: newPosition,
      updatedAt: new Date().toISOString(),
    };

    const remainingWorkspaces = workspaces.filter((w) => w.id !== draggableId);
    setWorkspaces([...remainingWorkspaces, updatedMovedItem]);

    // Persist to database; rollback on failure
    try {
      const res = await updateWorkspaceStatus(
        draggableId,
        destStatus,
        newPosition,
      );
      if (!res.success) {
        toast.error(res.error || "Failed to persist card movement");
        setWorkspaces(previousWorkspaces);
      }
    } catch {
      toast.error("Failed to persist card movement");
      setWorkspaces(previousWorkspaces);
    }
  };

  return {
    workspaces: filteredWorkspaces,
    allWorkspaces: workspaces,
    metrics,
    filter: {
      search,
      setSearch,
      status: statusFilter,
      setStatus: setStatusFilter,
    },
    actions: {
      onDragEnd,
      createWorkspace: handleCreated,
      renameWorkspace: handleRename,
      deleteWorkspace: handleDelete,
    },
  };
}

/**
 * Calculates aggregate status counts for Kanban overview cards.
 */
function calculateMetrics(workspaces: WorkspaceItem[]) {
  const total = workspaces.length;
  const planning = workspaces.filter(
    (w) => w.status === WorkspaceStatus.PLANNING,
  ).length;
  const inProgress = workspaces.filter(
    (w) => w.status === WorkspaceStatus.IN_PROGRESS,
  ).length;
  const paused = workspaces.filter(
    (w) => w.status === WorkspaceStatus.PAUSED,
  ).length;
  const done = workspaces.filter(
    (w) => w.status === WorkspaceStatus.DONE,
  ).length;
  return { total, planning, inProgress, paused, done };
}

/**
 * Filters workspaces by search query (name or description) and status column.
 */
function filterWorkspaces(
  workspaces: WorkspaceItem[],
  search: string,
  statusFilter: string,
): WorkspaceItem[] {
  const query = search.trim().toLowerCase();
  return workspaces.filter((w) => {
    const matchesSearch =
      !query ||
      w.name.toLowerCase().includes(query) ||
      Boolean(w.description && w.description.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "ALL" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

/**
 * Computes midpoint order position using fractional indexing for card placement.
 */
function calculateNextPosition(
  destColumnItems: WorkspaceItem[],
  destinationIndex: number,
): number {
  if (destColumnItems.length === 0) {
    return 1000;
  }
  if (destinationIndex === 0) {
    return destColumnItems[0].position / 2;
  }
  if (destinationIndex >= destColumnItems.length) {
    return destColumnItems[destColumnItems.length - 1].position + 1000;
  }
  const prevPos = destColumnItems[destinationIndex - 1].position;
  const nextPos = destColumnItems[destinationIndex].position;
  return (prevPos + nextPos) / 2;
}
