import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PageTreeNode } from "@shared/schema";

interface PageTreeSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documentId: string | null;
  documentTitle: string;
  pages: PageTreeNode[];
  isLoading: boolean;
  canEdit: boolean;
  onAddPage: (title: string) => Promise<void>;
  onNavigateToPage: (pageId: string) => void;
  currentPageId?: string;
}

interface PageTreeItemProps {
  page: PageTreeNode;
  depth: number;
  onNavigate: (pageId: string) => void;
  currentPageId?: string;
}

function PageTreeItem({ page, depth, onNavigate, currentPageId }: PageTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isActive = page.id === currentPageId;

  return (
    <div>
      <button
        onClick={() => onNavigate(page.id)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1.5 px-2 rounded-md text-sm transition-colors text-left group",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <FileText className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        <span className="truncate flex-1">{page.title || "Untitled"}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {page.children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              depth={depth + 1}
              onNavigate={onNavigate}
              currentPageId={currentPageId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageTreeSidebar({
  isOpen,
  onToggle,
  documentId,
  documentTitle,
  pages,
  isLoading,
  canEdit,
  onAddPage,
  onNavigateToPage,
  currentPageId,
}: PageTreeSidebarProps) {
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPage = async () => {
    if (!newPageTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddPage(newPageTitle.trim());
      setNewPageTitle("");
      setIsAddingPage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleAddPage();
    } else if (e.key === "Escape") {
      setIsAddingPage(false);
      setNewPageTitle("");
    }
  };

  // Don't render anything when closed or if no document
  if (!isOpen || !documentId) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
          Pages
        </h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Document root */}
      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => documentId && onNavigateToPage(documentId)}
          className={cn(
            "w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm transition-colors text-left",
            currentPageId === documentId
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          )}
        >
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="truncate font-medium">{documentTitle || "Untitled Document"}</span>
        </button>
      </div>

      {/* Page tree content */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            No pages yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {pages.map((page) => (
              <PageTreeItem
                key={page.id}
                page={page}
                depth={0}
                onNavigate={onNavigateToPage}
                currentPageId={currentPageId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add page section */}
      {canEdit && documentId && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {isAddingPage ? (
            <div className="space-y-2">
              <Input
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Page title..."
                className="h-8 text-sm"
                autoFocus
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddPage}
                  disabled={!newPageTitle.trim() || isSubmitting}
                  className="flex-1 h-7"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingPage(false);
                    setNewPageTitle("");
                  }}
                  disabled={isSubmitting}
                  className="h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingPage(true)}
              className="w-full h-8 text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Page
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
