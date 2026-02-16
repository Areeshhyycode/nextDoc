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
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";

const VIRTUALIZATION_THRESHOLD = 50;

export const docKeys = {
  all: ['docs'] as const,
  lists: () => [...docKeys.all, 'list'] as const,
  list: (filter: string) => [...docKeys.lists(), filter] as const,
  detail: (id: string) => [...docKeys.all, 'detail', id] as const,
  shares: (id: string) => [...docKeys.all, 'shares', id] as const,
  trash: () => [...docKeys.all, 'trash'] as const,
};

export default function DocsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

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
    refetchInterval: 15_000,
  });

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
  const duplicateDocIds = useDuplicateDetection(documents);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0f18]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
          <VirtualizedDocumentsTable documents={filteredAndSortedDocuments} duplicateDocIds={duplicateDocIds} />
        ) : (
          <DocumentsTable documents={filteredAndSortedDocuments} duplicateDocIds={duplicateDocIds} />
        )}

        {filteredAndSortedDocuments.length > 0 && <DocsFooterStats count={filteredAndSortedDocuments.length} />}
      </div>

      <ImportModal isOpen={showImportModal} onClose={handleCloseImport} />
    </div>
  );
}
