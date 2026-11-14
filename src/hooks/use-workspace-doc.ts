import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { saveDocMarkdown } from "@/actions/doc";

interface UseWorkspaceDocOptions {
  workspaceId: string;
  initialMarkdown: string;
}

export function useWorkspaceDoc({
  workspaceId,
  initialMarkdown,
}: UseWorkspaceDocOptions) {
  const [prevInitial, setPrevInitial] = useState(initialMarkdown);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [savedMarkdown, setSavedMarkdown] = useState(initialMarkdown);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if initialMarkdown changes from parent
  if (prevInitial !== initialMarkdown) {
    setPrevInitial(initialMarkdown);
    setMarkdown(initialMarkdown);
    setSavedMarkdown(initialMarkdown);
  }

  const handleSave = useCallback(async () => {
    if (isSaving || markdown === savedMarkdown) return;
    setIsSaving(true);

    try {
      const res = await saveDocMarkdown(workspaceId, markdown);
      if (res.success) {
        setSavedMarkdown(markdown);
        toast.success("Document saved");
      } else {
        toast.error(res.error || "Failed to save document");
      }
    } catch {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [workspaceId, markdown, savedMarkdown, isSaving]);

  // Keyboard shortcut: Ctrl + S / Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return {
    markdown,
    isSaving,
    isSaved: markdown === savedMarkdown,
    handleMarkdownChange: setMarkdown,
    handleSave,
  };
}
