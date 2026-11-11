import { useState, useEffect } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { toast } from "sonner";
import { WorkspaceItem } from "@/types/workspace";
import {
  createWorkspace as createWorkspaceAction,
  updateWorkspaceStatus,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspace";
import type { CreateWorkspaceInput } from "@/validators/workspace";
import { subscribeToKanban } from "@/lib/realtime";

/**
 * Main hook managing Kanban board state, filters, and drag-and-drop actions.
 */
export function useKanban(initialWorkspaces: WorkspaceItem[]) {
  const [workspaces, setWorkspaces] =
    useState<WorkspaceItem[]>(initialWorkspaces);
  const [prevInitial, setPrevInitial] = useState(initialWorkspaces);

  // Sync state if server re-renders with fresh initial data
  if (prevInitial !== initialWorkspaces) {
    setPrevInitial(initialWorkspaces);
    setWorkspaces(initialWorkspaces);
  }

  // Real-time synchronization across clients and tabs
  useEffect(() => {
    return subscribeToKanban((mutation) => {
      if (mutation.type === "INSERT") {
        setWorkspaces((prev) =>
          prev.some((w) => w.id === mutation.record.id)
            ? prev
            : [...prev, mutation.record],
        );
      } else if (mutation.type === "UPDATE") {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === mutation.record.id ? { ...w, ...mutation.record } : w,
          ),
        );
      } else if (mutation.type === "DELETE") {
        setWorkspaces((prev) => prev.filter((w) => w.id !== mutation.id));
      }
    });
  }, []);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pure data computations
  const filteredWorkspaces = filterWorkspaces(workspaces, search, statusFilter);

  // Actions
  const createWorkspace = async (
    input: CreateWorkspaceInput,
  ): Promise<boolean> => {
    const res = await createWorkspaceAction(input);
    if (!res.success || !res.workspace) {
      toast.error(res.error || "Failed to create workspace");
      return false;
    }

    setWorkspaces((prev) => [...prev, res.workspace]);
    toast.success("Workspace created");
    return true;
  };

  const renameWorkspace = async (
    id: string,
    newName: string,
  ): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

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
  };

  const deleteWorkspaceAction = async (id: string): Promise<boolean> => {
    const res = await deleteWorkspace(id);
    if (!res.success) {
      toast.error(res.error || "Failed to delete workspace");
      return false;
    }

    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    toast.success("Workspace deleted");
    return true;
  };

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
    const movedItem = workspaces.find((w) => w.id === draggableId);
    if (!movedItem) return;

    const newPosition = calculateNextPosition(
      workspaces,
      destStatus,
      draggableId,
      destination.index,
    );
    const prevWorkspaces = [...workspaces];
    const updatedItem: WorkspaceItem = {
      ...movedItem,
      status: destStatus,
      position: newPosition,
    };

    setWorkspaces([
      ...workspaces.filter((w) => w.id !== draggableId),
      updatedItem,
    ]);

    const res = await updateWorkspaceStatus(
      draggableId,
      destStatus,
      newPosition,
    );
    if (!res.success) {
      toast.error(res.error || "Failed to persist card movement");
      setWorkspaces(prevWorkspaces);
    }
  };

  return {
    workspaces: filteredWorkspaces,
    allWorkspaces: workspaces,
    filter: {
      search,
      setSearch,
      status: statusFilter,
      setStatus: setStatusFilter,
    },
    actions: {
      onDragEnd,
      createWorkspace,
      renameWorkspace,
      deleteWorkspace: deleteWorkspaceAction,
    },
  };
}

function filterWorkspaces(
  workspaces: WorkspaceItem[],
  search: string,
  statusFilter: string,
) {
  const query = search.trim().toLowerCase();
  return workspaces.filter((w) => {
    const matchesSearch =
      !query ||
      w.name.toLowerCase().includes(query) ||
      Boolean(w.description?.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "ALL" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

function calculateNextPosition(
  workspaces: WorkspaceItem[],
  destStatus: WorkspaceStatus,
  draggableId: string,
  destinationIndex: number,
): number {
  const colItems = workspaces
    .filter((w) => w.status === destStatus && w.id !== draggableId)
    .sort((a, b) => a.position - b.position);

  if (colItems.length === 0) return 1000;
  if (destinationIndex === 0) return colItems[0].position / 2;
  if (destinationIndex >= colItems.length)
    return colItems[colItems.length - 1].position + 1000;
  return (
    (colItems[destinationIndex - 1].position +
      colItems[destinationIndex].position) /
    2
  );
}
