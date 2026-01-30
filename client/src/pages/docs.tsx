import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { DocumentWithOwner } from "@shared/schema";
import { DocsHeader } from "@/components/docs/components/docs-header";
import { DocsToolbar, type SortField, type SortDirection } from "@/components/docs/components/docs-toolbar";
import { DocsEmptyState } from "@/components/docs/components/docs-empty-state";
import { DocumentsTable } from "@/components/docs/components/documents-table";
import { VirtualizedDocumentsTable } from "@/components/docs/components/virtualized-documents-table";
import { DocsLoadingSpinner } from "@/components/docs/components/docs-loading-spinner";
import { DocsFooterStats } from "@/components/docs/components/docs-footer-stats";
import { TemplatesSection } from "@/components/docs/components/templates-section";
import { ImportModal } from "@/components/docs/import-modal/index";
import { type FilterState, defaultFilterState } from "@/components/docs/components/docs-filter-popover";
import { useDocumentFiltering } from "@/hooks/use-document-filtering";

// Threshold for using virtualized table (for better performance with large lists)
const VIRTUALIZATION_THRESHOLD = 50;

// Query key factory for consistent cache management
export const docKeys = {
  all: ['docs'] as const,
  lists: () => [...docKeys.all, 'list'] as const,
  list: (filter: string) => [...docKeys.lists(), filter] as const,
  detail: (id: string) => [...docKeys.all, 'detail', id] as const,
  shares: (id: string) => [...docKeys.all, 'shares', id] as const,
};

export default function DocsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  // Memoize filter computation
  const filter = useMemo(() => {
    if (location === '/docs/my') return 'my';
    if (location === '/docs/meeting-notes') return 'meeting_notes';
    return 'all';
  }, [location]);

  const { data: documents = [], isLoading } = useQuery<DocumentWithOwner[]>({
    queryKey: docKeys.list(filter),
    queryFn: async () => {
      const response = await fetch(`/api/docs?filter=${filter}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15_000, // Auto-refresh so shared docs appear without manual reload
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleCreateDoc = useCallback(
    (category: 'blank' | 'meeting_notes' | 'project_overview') => setLocation(`/docs/new?category=${category}`),
    [setLocation]
  );

  const handleOpenImport = useCallback(() => setShowImportModal(true), []);
  const handleCloseImport = useCallback(() => setShowImportModal(false), []);

  const handleSortChange = useCallback(
    (field: SortField, direction: SortDirection) => {
      setSortField(field);
      setSortDirection(direction);
    },
    []
  );

  const filteredAndSortedDocuments = useDocumentFiltering({ documents, searchQuery, filters, sortField, sortDirection });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12 py-2 sm:py-5 lg:py-8">
        <DocsHeader onCreateDoc={handleCreateDoc} onImport={handleOpenImport} />

        <TemplatesSection
          onCreateProjectOverview={() => handleCreateDoc('project_overview')}
          onCreateMeetingNotes={() => handleCreateDoc('meeting_notes')}
        />

        <DocsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={showSearch}
          onShowSearchChange={setShowSearch}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {isLoading ? (
          <DocsLoadingSpinner />
        ) : filteredAndSortedDocuments.length === 0 ? (
          <DocsEmptyState searchQuery={searchQuery} onCreateBlank={() => handleCreateDoc('blank')} onCreateMeetingNotes={() => handleCreateDoc('meeting_notes')} />
        ) : filteredAndSortedDocuments.length > VIRTUALIZATION_THRESHOLD ? (
          <VirtualizedDocumentsTable documents={filteredAndSortedDocuments} />
        ) : (
          <DocumentsTable documents={filteredAndSortedDocuments} />
        )}

        {filteredAndSortedDocuments.length > 0 && <DocsFooterStats count={filteredAndSortedDocuments.length} />}
      </div>

      <ImportModal isOpen={showImportModal} onClose={handleCloseImport} />
    </div>
  );
}
