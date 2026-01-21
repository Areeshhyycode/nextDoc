import { MessageSquare, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DocSettingsDropdown } from "./doc-settings-dropdown";
import type { DocumentWithOwner } from "@shared/schema";

interface SidebarIconsProps {
  commentsOpen: boolean;
  pageStylesOpen: boolean;
  onCommentsToggle: () => void;
  onPageStylesToggle: () => void;
  commentsCount?: number;
  isNewDoc?: boolean;
  document?: DocumentWithOwner | null;
}

export function SidebarIcons({
  commentsOpen,
  pageStylesOpen,
  onCommentsToggle,
  onPageStylesToggle,
  commentsCount = 0,
  isNewDoc = false,
  document
}: SidebarIconsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg shadow-lg py-2">
        {/* Comments Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCommentsToggle}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                commentsOpen
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
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
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
            Comments
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />

        {/* Page Styles Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onPageStylesToggle}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 transition-all group",
                pageStylesOpen
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              data-testid="sidebar-icon-page-styles"
            >
              <span className="text-lg font-semibold">Aa</span>
              {pageStylesOpen && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
            Page Styles
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2" />

        {/* Doc Settings */}
        {document && !isNewDoc ? (
          <DocSettingsDropdown
            doc={document}
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="relative flex flex-col items-center justify-center w-12 h-12 transition-all group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    data-testid="sidebar-icon-doc-settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
                  Doc Settings
                </TooltipContent>
              </Tooltip>
            }
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative flex flex-col items-center justify-center w-12 h-12 transition-all group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                data-testid="sidebar-icon-doc-settings"
                disabled
              >
                <Settings className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 text-sm">
              Save document first
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
