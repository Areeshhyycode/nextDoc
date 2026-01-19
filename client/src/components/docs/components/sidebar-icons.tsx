import { MessageSquare, Plus, Pencil, Link, Star, FolderInput, Copy, LayoutTemplate, Archive, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface SidebarIconsProps {
  commentsOpen: boolean;
  pageStylesOpen: boolean;
  onCommentsToggle: () => void;
  onPageStylesToggle: () => void;
  commentsCount?: number;
  isNewDoc?: boolean;
}

export function SidebarIcons({ 
  commentsOpen, 
  pageStylesOpen, 
  onCommentsToggle, 
  onPageStylesToggle,
  commentsCount = 0,
  isNewDoc = false
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

        {/* Doc Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              data-testid="sidebar-icon-doc-settings"
            >
              <Plus className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start" className="w-56 p-2">
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              Doc settings
            </div>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer">
              <Pencil className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Rename</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer">
              <Link className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Copy link</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Favorite</span>
              </div>
              <span className="text-gray-400 text-xs">›</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between">
              <div className="flex items-center gap-3">
                <FolderInput className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Move to</span>
              </div>
              <span className="text-gray-400 text-xs">›</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer">
              <Copy className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Duplicate</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Templates</span>
              </div>
              <span className="text-gray-400 text-xs">›</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer">
              <Archive className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Archive</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Delete</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="flex items-center justify-between py-2 px-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Protect Doc</span>
              </div>
              <Switch />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-3 py-2.5 px-3 rounded-md cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
              <span className="text-sm font-medium">Sharing and Permissions</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
