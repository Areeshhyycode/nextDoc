/**
 * Template Preview Modal - Clean & Minimal
 *
 * Features:
 * - Left sidebar with nested pages
 * - Right content area showing SELECTED page content
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Search/filter templates
 * - Mobile responsive
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Re-export types and data for backward compatibility
export type { TemplatePage, TemplatePageContent, TemplateData } from "./template-preview/types";
export { projectOverviewTemplate, meetingNotesTemplate, generateTemplateContent } from "./template-preview/template-data";

import type { TemplatePage } from "./template-preview/types";
import { projectOverviewTemplate, meetingNotesTemplate } from "./template-preview/template-data";
import { TemplateSidebar } from "./template-preview/TemplateSidebar";
import { TemplateContent } from "./template-preview/TemplateContent";
import { TemplateFooter } from "./template-preview/TemplateFooter";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: "project_overview" | "meeting_notes";
  onUseTemplate: (selectedPage: TemplatePage) => void;
  documentId?: string | null;
  onAddPage?: (title: string) => Promise<void>;
  isAddingPage?: boolean;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  templateType,
  onUseTemplate,
  documentId,
  onAddPage,
  isAddingPage = false,
}: TemplatePreviewModalProps) {
  const template = templateType === "project_overview"
    ? projectOverviewTemplate
    : meetingNotesTemplate;

  const [selectedPageId, setSelectedPageId] = useState(template.pages[0]?.id || "");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Flatten pages for keyboard navigation
  const flattenPages = useCallback((pages: TemplatePage[]): TemplatePage[] => {
    return pages.reduce((acc: TemplatePage[], page) => {
      acc.push(page);
      if (page.children && expandedIds.has(page.id)) {
        acc.push(...flattenPages(page.children));
      }
      return acc;
    }, []);
  }, [expandedIds]);

  // Filter pages based on search
  const filterPages = useCallback((pages: TemplatePage[], query: string): TemplatePage[] => {
    if (!query.trim()) return pages;
    const lowerQuery = query.toLowerCase();
    return pages.filter(page =>
      page.title.toLowerCase().includes(lowerQuery) ||
      page.content.heading.toLowerCase().includes(lowerQuery) ||
      page.content.description?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const filteredPages = filterPages(template.pages, searchQuery);
  const flatPages = flattenPages(filteredPages);

  // Reset state when template changes
  useEffect(() => {
    setSelectedPageId(template.pages[0]?.id || "");
    setExpandedIds(new Set());
    setSearchQuery("");
    setShowSearch(false);
  }, [templateType, template.pages]);

  // Find selected page recursively
  const findPage = (pages: TemplatePage[], id: string): TemplatePage | null => {
    for (const page of pages) {
      if (page.id === id) return page;
      if (page.children) {
        const found = findPage(page.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedPage = findPage(template.pages, selectedPageId);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectPage = (id: string) => {
    setIsAnimating(true);
    setSelectedPageId(id);
    setTimeout(() => setIsAnimating(false), 150);
  };

  const handleUseTemplate = () => {
    if (selectedPage) {
      onUseTemplate(selectedPage);
    }
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    const currentIndex = flatPages.findIndex(p => p.id === selectedPageId);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (currentIndex < flatPages.length - 1) {
          handleSelectPage(flatPages[currentIndex + 1].id);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (currentIndex > 0) {
          handleSelectPage(flatPages[currentIndex - 1].id);
        }
        break;
      case "Enter":
        if (!showSearch && selectedPage) {
          e.preventDefault();
          handleUseTemplate();
        }
        break;
      case "Escape":
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
        } else {
          onClose();
        }
        break;
      case "/":
        if (!showSearch) {
          e.preventDefault();
          setShowSearch(true);
        }
        break;
    }
  }, [isOpen, flatPages, selectedPageId, selectedPage, showSearch, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[94%] sm:w-[92%] md:w-[95vw] max-w-[900px] h-[80vh] sm:h-[82vh] md:h-[85vh] max-h-[700px] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-gray-800 rounded-xl"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>{template.name} Template Preview</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-1 overflow-hidden">
          <TemplateSidebar
            template={template}
            filteredPages={filteredPages}
            selectedPageId={selectedPageId}
            expandedIds={expandedIds}
            searchQuery={searchQuery}
            showSearch={showSearch}
            sidebarCollapsed={sidebarCollapsed}
            onSelectPage={handleSelectPage}
            onToggleExpanded={toggleExpanded}
            onSearchChange={setSearchQuery}
            onToggleSearch={() => setShowSearch(!showSearch)}
            onCollapse={() => setSidebarCollapsed(true)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <TemplateContent
              template={template}
              selectedPage={selectedPage}
              sidebarCollapsed={sidebarCollapsed}
              isAnimating={isAnimating}
              onClose={onClose}
              onExpandSidebar={() => setSidebarCollapsed(false)}
              pages={filteredPages}
              selectedPageId={selectedPageId}
              onSelectPage={handleSelectPage}
            />

            <TemplateFooter
              selectedPage={selectedPage}
              documentId={documentId}
              onAddPage={onAddPage}
              isAddingPage={isAddingPage}
              onUseTemplate={handleUseTemplate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
