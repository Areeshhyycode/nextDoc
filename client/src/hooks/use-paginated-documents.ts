import { useInfiniteQuery } from "@tanstack/react-query";
import type { DocumentWithOwner } from "@shared/schema";
import { docKeys } from "@/pages/docs";

interface PaginatedDocumentsResponse {
  documents: DocumentWithOwner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface UsePaginatedDocumentsOptions {
  filter: 'all' | 'my' | 'shared' | 'meeting_notes';
  search?: string;
  sortField?: 'created_at' | 'updated_at' | 'title' | 'last_viewed_at';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching documents with server-side pagination
 * Uses infinite query for seamless scroll experience
 */
export function usePaginatedDocuments({
  filter,
  search = '',
  sortField = 'updated_at',
  sortDirection = 'desc',
  limit = 20,
  enabled = true
}: UsePaginatedDocumentsOptions) {
  return useInfiniteQuery<PaginatedDocumentsResponse>({
    queryKey: [...docKeys.lists(), 'paginated', filter, search, sortField, sortDirection, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
        filter,
        sortField,
        sortDirection,
        search
      });

      const response = await fetch(`/api/docs/paginated?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Helper to flatten paginated results into a single array
 */
export function flattenPaginatedDocuments(
  pages: PaginatedDocumentsResponse[] | undefined
): DocumentWithOwner[] {
  if (!pages) return [];
  return pages.flatMap(page => page.documents);
}

/**
 * Get total count from paginated response
 */
export function getTotalFromPaginated(
  pages: PaginatedDocumentsResponse[] | undefined
): number {
  if (!pages || pages.length === 0) return 0;
  return pages[0].total;
}
