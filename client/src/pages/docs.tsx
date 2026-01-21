import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { DocumentWithOwner } from "@shared/schema";

// Components
import { DocsHeader } from "@/components/docs/components/docs-header";
import { DocsToolbar, type SortField, type SortDirection } from "@/components/docs/components/docs-toolbar";
import { DocsEmptyState } from "@/components/docs/components/docs-empty-state";
import { DocumentsTable } from "@/components/docs/components/documents-table";
import { TemplateCard } from "@/components/docs/components/template-card";
import { ProjectOverviewIcon, MeetingNotesIcon } from "@/components/docs/components/document-icons";
import { ImportModal } from "@/components/docs/import-modal/index";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5"></div>
      <p className="text-base text-gray-500 dark:text-gray-400">Loading documents...</p>
    </div>
  );
}

// Footer stats component
function FooterStats({ count }: { count: number }) {
  return (
    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{count}</span> document{count !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <span>Last synced just now</span>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filter = location === '/docs/my' ? 'my'
    : location === '/docs/meeting-notes' ? 'meeting_notes'
    : 'all';

  const { data: documents = [], isLoading } = useQuery<DocumentWithOwner[]>({
    queryKey: [`/api/docs?filter=${filter}`],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleCreateDoc = (category: 'blank' | 'meeting_notes' | 'project_overview') => {
    setLocation(`/docs/new?category=${category}`);
  };

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter(doc =>
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        case 'owner':
          comparison = (a.owner?.displayName || '').localeCompare(b.owner?.displayName || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [documents, searchQuery, sortField, sortDirection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-10">
        {/* Header */}
        <DocsHeader
          onCreateDoc={handleCreateDoc}
          onImport={() => setShowImportModal(true)}
        />

        {/* Templates Section */}
        <div className="mb-4 sm:mb-6">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-1.5 sm:mb-2">Templates</p>
          <div className="grid grid-cols-2 gap-2 max-w-2xl">
            <TemplateCard
              icon={<ProjectOverviewIcon />}
              title="Project Overview"
              description="Summarize goals, scope, and milestones"
              onClick={() => handleCreateDoc('project_overview')}
            />
            <TemplateCard
              icon={<MeetingNotesIcon />}
              title="Meeting Notes"
              description="Capture an agenda, notes, and action items"
              onClick={() => handleCreateDoc('meeting_notes')}
            />
          </div>
        </div>

        {/* Toolbar */}
        <DocsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={showSearch}
          onShowSearchChange={setShowSearch}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredAndSortedDocuments.length === 0 ? (
          <DocsEmptyState
            searchQuery={searchQuery}
            onCreateBlank={() => handleCreateDoc('blank')}
            onCreateMeetingNotes={() => handleCreateDoc('meeting_notes')}
          />
        ) : (
          <DocumentsTable documents={filteredAndSortedDocuments} />
        )}

        {/* Footer Stats */}
        {filteredAndSortedDocuments.length > 0 && (
          <FooterStats count={filteredAndSortedDocuments.length} />
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
