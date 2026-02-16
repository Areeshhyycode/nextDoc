import { useMemo } from "react";
import type { DocumentWithOwner } from "@shared/schema";

/**
 * Detects documents with duplicate (case-insensitive) titles.
 * Returns a Set of document IDs that share a name with at least one other document.
 */
export function useDuplicateDetection(documents: DocumentWithOwner[]): Set<string> {
  return useMemo(() => {
    const titleGroups = new Map<string, string[]>();

    for (const doc of documents) {
      const normalized = (doc.title || "").trim().toLowerCase();
      if (!normalized) continue;

      const group = titleGroups.get(normalized);
      if (group) {
        group.push(doc.id);
      } else {
        titleGroups.set(normalized, [doc.id]);
      }
    }

    const duplicateIds = new Set<string>();
    titleGroups.forEach((ids) => {
      if (ids.length > 1) {
        ids.forEach((id) => duplicateIds.add(id));
      }
    });

    return duplicateIds;
  }, [documents]);
}
