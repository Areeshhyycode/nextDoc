import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { DocumentWithPermission } from "./types";

export function useDocumentPermissions(document: DocumentWithPermission | undefined) {
  const { toast } = useToast();
  const [hasShownViewOnlyWarning, setHasShownViewOnlyWarning] = useState(false);

  const isOwner = !document || document.userPermission === "owner";
  const canEdit = isOwner || document?.userPermission === "edit" || document?.userPermission === "edit_comment";
  const canComment = isOwner || document?.userPermission === "comment" || document?.userPermission === "edit_comment";
  const isViewOnly = document?.userPermission === "view";
  const isCommentOnly = document?.userPermission === "comment";
  const isEditOnly = document?.userPermission === "edit";
  const canEditAndComment = document?.userPermission === "edit_comment";

  const showNoEditWarning = useCallback(() => {
    if (!hasShownViewOnlyWarning) {
      const permissionType = isViewOnly ? "view" : "comment";
      toast({
        title: permissionType === "view" ? "Read-Only Document" : "Comment-Only Access",
        description: permissionType === "view"
          ? "This document is read-only. You have view permissions and cannot make edits."
          : "You have comment-only permissions for this document. Editing is restricted, but you can add comments.",
        variant: "warning",
      });
      setHasShownViewOnlyWarning(true);
    }
  }, [hasShownViewOnlyWarning, toast, isViewOnly]);

  /** Returns true if the edit should be blocked */
  const shouldBlockEdit = useCallback((): boolean => {
    if ((isViewOnly || isCommentOnly) && document) {
      showNoEditWarning();
      return true;
    }
    return false;
  }, [isViewOnly, isCommentOnly, document, showNoEditWarning]);

  return {
    isOwner,
    canEdit,
    canComment,
    isViewOnly,
    isCommentOnly,
    isEditOnly,
    canEditAndComment,
    shouldBlockEdit,
  };
}
