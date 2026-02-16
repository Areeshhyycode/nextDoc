import { MessageSquare, FileText, FilePlus, Settings2, List, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDocToolbarProps {
  commentsOpen: boolean;
  pageStylesOpen: boolean;
  pagesOpen: boolean;
  outlineOpen?: boolean;
  versionsOpen?: boolean;
  onCommentsToggle: () => void;
  onPageStylesToggle: () => void;
  onPagesToggle: () => void;
  onOutlineToggle?: () => void;
  onVersionsToggle?: () => void;
  commentsCount?: number;
  pagesCount?: number;
  isNewDoc?: boolean;
  canAddPage?: boolean;
  onAddPage?: () => void;
  canEdit?: boolean;
}

export function MobileDocToolbar({
  commentsOpen,
  pageStylesOpen,
  pagesOpen,
  outlineOpen = false,
  versionsOpen = false,
  onCommentsToggle,
  onPageStylesToggle,
  onPagesToggle,
  onOutlineToggle,
  onVersionsToggle,
  commentsCount = 0,
  pagesCount = 0,
  isNewDoc = false,
  canAddPage = false,
  onAddPage,
  canEdit = true,
}: MobileDocToolbarProps) {
  return (
    <div className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {/* Add Page */}
      {canAddPage && onAddPage && (
        <button
          onClick={onAddPage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex-shrink-0"
        >
          <FilePlus className="h-3.5 w-3.5" />
          <span>Add Page</span>
        </button>
      )}

      {/* Divider */}
      {canAddPage && onAddPage && (
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      )}

      {/* Pages */}
      {!isNewDoc && (
        <button
          onClick={onPagesToggle}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0",
            pagesOpen
              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Pages</span>
          {pagesCount > 0 && (
            <span className="bg-teal-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {pagesCount > 9 ? '9+' : pagesCount}
            </span>
          )}
        </button>
      )}

      {/* Outline */}
      {onOutlineToggle && (
        <button
          onClick={onOutlineToggle}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0",
            outlineOpen
              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span>Outline</span>
        </button>
      )}

      {/* Comments */}
      <button
        onClick={onCommentsToggle}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0",
          commentsOpen
            ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Comments</span>
        {commentsCount > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {commentsCount > 9 ? '9+' : commentsCount}
          </span>
        )}
      </button>

      {/* Version History */}
      {!isNewDoc && onVersionsToggle && (
        <button
          onClick={onVersionsToggle}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0",
            versionsOpen
              ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <History className="h-3.5 w-3.5" />
          <span>History</span>
        </button>
      )}

      {/* Page Styles — only shown for users who can edit */}
      {canEdit && (
        <button
          onClick={onPageStylesToggle}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex-shrink-0",
            pageStylesOpen
              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Styles</span>
        </button>
      )}
    </div>
  );
}
