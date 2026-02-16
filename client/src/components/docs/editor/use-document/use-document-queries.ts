import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DocumentWithPermission } from "./types";

/** Fetch existing document (includes userPermission from backend) */
export function useDocumentFetch(docId: string | null, isNewDoc: boolean) {
  const { data: document, isLoading, error: documentError } = useQuery<DocumentWithPermission>({
    queryKey: ["/api/docs", docId],
    enabled: !isNewDoc && !!docId,
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // Auto-refresh document metadata every 10s so "Last updated by" stays fresh
  useEffect(() => {
    if (isNewDoc || !docId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", docId] });
    }, 10000);
    return () => clearInterval(interval);
  }, [docId, isNewDoc]);

  const hasNoAccess = (documentError as any)?.status === 403;

  return { document, isLoading, hasNoAccess };
}

/** Fetch comments for count badge */
export function useDocumentComments(docId: string | null, isNewDoc: boolean) {
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ["/api/docs", docId, "comments"],
    enabled: !isNewDoc && !!docId,
  });

  const openCommentsCount = comments.filter(
    (c: any) => c.status === "open"
  ).length;

  return { openCommentsCount };
}

/** Track document view when opened */
export function useDocumentViewTracking(docId: string | null, isNewDoc: boolean) {
  useEffect(() => {
    if (docId && !isNewDoc) {
      apiRequest("PATCH", `/api/docs/${docId}/view`)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
        })
        .catch((err) => {
          console.error("Failed to track document view:", err);
        });
    }
  }, [docId, isNewDoc]);
}
