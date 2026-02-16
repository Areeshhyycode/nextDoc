import { MessageSquare, FileText, FilePlus, List, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarIconsProps {
  commentsOpen: boolean;
  pageStylesOpen: boolean;
  pagesOpen?: boolean;
  outlineOpen?: boolean;
  versionsOpen?: boolean;
  onCommentsToggle: () => void;
  onPageStylesToggle: () => void;
  onPagesToggle?: () => void;
  onOutlineToggle?: () => void;
  onVersionsToggle?: () => void;
  commentsCount?: number;
  pagesCount?: number;
  isNewDoc?: boolean;
  /** Show add page button */
  canAddPage?: boolean;
  /** Callback when add page button is clicked */
  onAddPage?: () => void;
  /** Can user edit the document (controls page styles visibility) */
  canEdit?: boolean;
}

export function SidebarIcons({
  commentsOpen,
  pageStylesOpen,
  pagesOpen = false,
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
}: SidebarIconsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg shadow-lg py-2">
        {/* Add Page Icon */}
        {canAddPage && onAddPage && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddPage}
                  className="relative flex flex-col items-center justify-center w-12 h-12 transition-all group hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  data-testid="sidebar-icon-add-page"
                >
                  <FilePlus className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                Add Page
              </TooltipContent>
            </Tooltip>
            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />
          </>
        )}

        {/* Pages Icon */}
        {onPagesToggle && !isNewDoc && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onPagesToggle}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                    pagesOpen
                      ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  data-testid="sidebar-icon-pages"
                >
                  <FileText className="h-5 w-5" />
                  {pagesCount > 0 && (
                    <span className="absolute top-1 right-1 bg-teal-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                      {pagesCount > 9 ? '9+' : pagesCount}
                    </span>
                  )}
                  {pagesOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-teal-600 dark:bg-teal-400 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                Pages
              </TooltipContent>
            </Tooltip>
            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />
          </>
        )}

        {/* Outline Icon */}
        {onOutlineToggle && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onOutlineToggle}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                    outlineOpen
                      ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  data-testid="sidebar-icon-outline"
                >
                  <List className="h-5 w-5" />
                  {outlineOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-teal-600 dark:bg-teal-400 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                Outline
              </TooltipContent>
            </Tooltip>
            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />
          </>
        )}

        {/* Comments Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCommentsToggle}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                commentsOpen
                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              data-testid="sidebar-icon-comments"
            >
              <MessageSquare className="h-5 w-5" />
              {commentsCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {commentsCount > 9 ? '9+' : commentsCount}
                </span>
              )}
              {commentsOpen && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-teal-600 dark:bg-teal-400 rounded-full" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
            Comments
          </TooltipContent>
        </Tooltip>

        {/* Version History Icon */}
        {onVersionsToggle && !isNewDoc && (
          <>
            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onVersionsToggle}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                    versionsOpen
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  data-testid="sidebar-icon-versions"
                >
                  <History className="h-5 w-5" />
                  {versionsOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-purple-600 dark:bg-purple-400 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                Version History
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Page Styles Icon — only shown for users who can edit */}
        {canEdit && (
          <>
            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onPageStylesToggle}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                    pageStylesOpen
                      ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  data-testid="sidebar-icon-page-styles"
                >
                  <span className="text-lg font-semibold">Aa</span>
                  {pageStylesOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-teal-600 dark:bg-teal-400 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                Page Styles
              </TooltipContent>
            </Tooltip>
          </>
        )}

      </div>
    </TooltipProvider>
  );
}
