import { useMemo } from "react";
import type { DocumentWithOwner } from "@shared/schema";
import type { FilterState } from "@/components/docs/components/docs-filter-popover";
import type { SortField, SortDirection } from "@/components/docs/components/docs-toolbar";

const isWithinDateRange = (date: string | Date | null | undefined, range: FilterState['dateRange']): boolean => {
  if (!date || range === 'all') return true;

  const docDate = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return docDate >= startOfToday;
    case 'week':
      const weekAgo = new Date(startOfToday);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return docDate >= weekAgo;
    case 'month':
      const monthAgo = new Date(startOfToday);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return docDate >= monthAgo;
    default:
      return true;
  }
};

interface UseDocumentFilteringParams {
  documents: DocumentWithOwner[];
  searchQuery: string;
  filters: FilterState;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function useDocumentFiltering({
  documents,
  searchQuery,
  filters,
  sortField,
  sortDirection,
}: UseDocumentFilteringParams): DocumentWithOwner[] {
  return useMemo(() => {
    const filtered = documents.filter(doc => {
      const matchesSearch = !searchQuery ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filters.categories.length === 0 ||
        filters.categories.includes(doc.category || 'blank');

      const matchesFavorite = !filters.isFavoriteOnly || doc.isFavorite;
      const matchesDate = isWithinDateRange(doc.createdAt, filters.dateRange);

      return matchesSearch && matchesCategory && matchesFavorite && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'created_at':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
        case 'viewed_at':
          comparison = new Date(a.lastViewedAt || 0).getTime() - new Date(b.lastViewedAt || 0).getTime();
          break;
        case 'owner':
          comparison = (a.owner?.displayName || '').localeCompare(b.owner?.displayName || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [documents, searchQuery, sortField, sortDirection, filters]);
}
