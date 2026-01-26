import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { DocumentWithOwner } from "@shared/schema";
import { DocsHeader } from "@/components/docs/components/docs-header";
import { DocsToolbar, type SortField, type SortDirection } from "@/components/docs/components/docs-toolbar";
import { DocsEmptyState } from "@/components/docs/components/docs-empty-state";
import { DocumentsTable } from "@/components/docs/components/documents-table";
import { DocsLoadingSpinner } from "@/components/docs/components/docs-loading-spinner";
import { DocsFooterStats } from "@/components/docs/components/docs-footer-stats";
import { TemplatesSection } from "@/components/docs/components/templates-section";
import { ImportModal } from "@/components/docs/import-modal/index";
import { type FilterState, defaultFilterState } from "@/components/docs/components/docs-filter-popover";
import { useDocumentFiltering } from "@/hooks/use-document-filtering";

export default function DocsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const filter = location === '/docs/my' ? 'my' : location === '/docs/meeting-notes' ? 'meeting_notes' : 'all';

  const { data: documents = [], isLoading } = useQuery<DocumentWithOwner[]>({
    queryKey: [`/api/docs?filter=${filter}`],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleCreateDoc = (category: 'blank' | 'meeting_notes' | 'project_overview') => setLocation(`/docs/new?category=${category}`);

  const filteredAndSortedDocuments = useDocumentFiltering({ documents, searchQuery, filters, sortField, sortDirection });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-5 lg:py-8">
        <DocsHeader onCreateDoc={handleCreateDoc} onImport={() => setShowImportModal(true)} />

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
          onSortChange={(field, direction) => { setSortField(field); setSortDirection(direction); }}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {isLoading ? (
          <DocsLoadingSpinner />
        ) : filteredAndSortedDocuments.length === 0 ? (
          <DocsEmptyState searchQuery={searchQuery} onCreateBlank={() => handleCreateDoc('blank')} onCreateMeetingNotes={() => handleCreateDoc('meeting_notes')} />
        ) : (
          <DocumentsTable documents={filteredAndSortedDocuments} />
        )}

        {filteredAndSortedDocuments.length > 0 && <DocsFooterStats count={filteredAndSortedDocuments.length} />}
      </div>

      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
}
