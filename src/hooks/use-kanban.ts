import { useState, useEffect, useMemo } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { WorkspaceStatus } from "@prisma/client";
import { toast } from "sonner";
import type { WorkspaceItem } from "@/types/workspace";
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
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [prevInitial, setPrevInitial] = useState(initialWorkspaces);

  // Sync state if server re-renders with fresh initial data
  if (prevInitial !== initialWorkspaces) {
    setPrevInitial(initialWorkspaces);
    setWorkspaces(initialWorkspaces);
  }

  // Real-time synchronization across clients and tabs
  useEffect(() => {
    return subscribeToKanban((m) => {
      setWorkspaces((prev) => {
        if (m.type === "INSERT") return prev.some((w) => w.id === m.record.id) ? prev : [...prev, m.record];
        if (m.type === "UPDATE") return prev.map((w) => (w.id === m.record.id ? { ...w, ...m.record } : w));
        if (m.type === "DELETE") return prev.filter((w) => w.id !== m.id);
        return prev;
      });
    });
  }, []);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredWorkspaces = useMemo(
    () => filterWorkspaces(workspaces, search, statusFilter),
    [workspaces, search, statusFilter],
  );

  // Actions
  const createWorkspace = async (input: CreateWorkspaceInput) => {
    const res = await createWorkspaceAction(input);
    if (!res.success || !res.workspace) {
      toast.error(res.error || "Failed to create workspace");
      return false;
    }
    setWorkspaces((prev) => [...prev, res.workspace]);
    toast.success("Workspace created");
    return true;
  };

  const renameWorkspace = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    const res = await updateWorkspace(id, { name: trimmed });
    if (!res.success) {
      toast.error(res.error || "Failed to rename workspace");
      return false;
    }
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, name: trimmed } : w)));
    toast.success("Workspace renamed");
    return true;
  };

  const deleteWorkspaceAction = async (id: string) => {
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
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const destStatus = destination.droppableId as WorkspaceStatus;
    const moved = workspaces.find((w) => w.id === draggableId);
    if (!moved) return;

    const colItems = workspaces
      .filter((w) => w.status === destStatus && w.id !== draggableId)
      .sort((a, b) => a.position - b.position);

    const newPosition = calculateNextPosition(colItems, destination.index);
    const prevWorkspaces = workspaces;
    const updated = { ...moved, status: destStatus, position: newPosition };

    setWorkspaces((prev) => prev.map((w) => (w.id === draggableId ? updated : w)));

    const res = await updateWorkspaceStatus(draggableId, destStatus, newPosition);
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

function calculateNextPosition(items: WorkspaceItem[], index: number): number {
  if (items.length === 0) return 1000;
  if (index === 0) return items[0].position / 2;
  if (index >= items.length) return items[items.length - 1].position + 1000;

  const prevPos = items[index - 1].position;
  const nextPos = items[index].position;
  return (prevPos + nextPos) / 2;
}
