import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, FileText, Loader2, Plus, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
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
            ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
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
  isCollapsed = false,
  onCollapseToggle,
}: PageTreeSidebarProps) {
  const isMobile = useIsMobile();

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, isOpen]);

  // Don't render anything when closed or if no document
  if (!isOpen || !documentId) {
    return null;
  }

  // On mobile: full-screen overlay like ClickUp
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={onToggle}
        />
        {/* Slide-over panel */}
        <div className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-white dark:bg-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Pages
            </h3>
            <button
              onClick={onToggle}
              className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Document root */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                documentId && onNavigateToPage(documentId);
                onToggle();
              }}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm transition-colors text-left",
                currentPageId === documentId
                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              )}
            >
              <FileText className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="truncate font-medium">{documentTitle || "Untitled Document"}</span>
            </button>
          </div>

          {/* Page tree content */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                No pages yet
              </div>
            ) : (
              <div className="space-y-1">
                {pages.map((page) => (
                  <PageTreeItem
                    key={page.id}
                    page={page}
                    depth={0}
                    onNavigate={(pageId) => {
                      onNavigateToPage(pageId);
                      onToggle();
                    }}
                    currentPageId={currentPageId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add page - bigger touch target */}
          {canEdit && documentId && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  await onAddPage("Untitled Page");
                }}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-sm transition-colors text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                <Plus className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Add Page</span>
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop: collapsed state - minimal vertical bar with expand button
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="fixed left-0 top-0 h-full w-12 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col items-center py-4 shadow-lg transition-all duration-300 ease-in-out">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCollapseToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Expand sidebar"
                aria-expanded="false"
              >
                <PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
              Expand Pages Sidebar
            </TooltipContent>
          </Tooltip>

          {/* Page count indicator */}
          {pages.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-1">
              <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {pages.length}
              </span>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Desktop: expanded state
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col shadow-lg transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
          Pages
        </h3>
        <div className="flex items-center gap-1">
          {/* Collapse Button */}
          {onCollapseToggle && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onCollapseToggle}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    aria-label="Collapse sidebar"
                    aria-expanded="true"
                  >
                    <PanelLeftClose className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                  Collapse Sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Close Button */}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Document root */}
      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => documentId && onNavigateToPage(documentId)}
          className={cn(
            "w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm transition-colors text-left",
            currentPageId === documentId
              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
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
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={async () => {
              await onAddPage("Untitled Page");
            }}
            className="w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm transition-colors text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span>Add Page</span>
          </button>
        </div>
      )}
    </div>
  );
}
