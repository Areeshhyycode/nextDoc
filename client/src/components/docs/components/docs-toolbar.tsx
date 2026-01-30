import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUpDown, Check, ArrowUp, ArrowDown, X, ChevronDown } from "lucide-react";
import { DocsFilterPopover, type FilterState } from "./docs-filter-popover";
import { useMemo } from "react";

export type SortField = 'name' | 'created_at' | 'updated_at' | 'viewed_at' | 'owner';
export type SortDirection = 'asc' | 'desc';

interface DocsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onShowSearchChange: (show: boolean) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Memoize sort options to prevent recreation on every render
const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'created_at', label: 'Date created' },
  { field: 'updated_at', label: 'Date updated' },
  { field: 'viewed_at', label: 'Date viewed' },
  { field: 'owner', label: 'Owner' },
] as const;

export function DocsToolbar({
  searchQuery,
  onSearchChange,
  showSearch,
  onShowSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  filters,
  onFiltersChange,
}: DocsToolbarProps) {
  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find(opt => opt.field === sortField)?.label || 'Sort',
    [sortField]
  );

  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-gray-100 dark:border-gray-800/50">
      {/* Row 1: Filter + Sort on mobile, inline on desktop */}
      <div className="flex flex-wrap items-center gap-2">
        <DocsFilterPopover
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 sm:h-9 px-3 sm:px-3.5 gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all touch-manipulation flex-1 sm:flex-none justify-between sm:justify-start min-h-[44px] sm:min-h-0"
              aria-label={`Sort by ${currentSortLabel}, ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Sort: {currentSortLabel}</span>
                <span className="hidden sm:inline">Sort</span>
              </div>
              <ChevronDown className="h-3 w-3 sm:hidden" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 p-1">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 font-medium">Sort by</p>
            </div>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.field}
                onClick={() => onSortChange(option.field, sortDirection)}
                className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between"
              >
                <span className="text-sm">{option.label}</span>
                {sortField === option.field && (
                  <Check className="h-4 w-4 text-blue-500" aria-label="Selected" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 font-medium">Direction</p>
            </div>
            <DropdownMenuItem
              onClick={() => onSortChange(sortField, 'asc')}
              className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Ascending</span>
              </div>
              {sortDirection === 'asc' && (
                <Check className="h-4 w-4 text-blue-500" aria-label="Selected" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(sortField, 'desc')}
              className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Descending</span>
              </div>
              {sortDirection === 'desc' && (
                <Check className="h-4 w-4 text-blue-500" aria-label="Selected" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search: Show button on desktop, inline on mobile when active */}
        <div className="flex-1 sm:flex-none sm:ml-auto">
          {showSearch ? (
            <div className="relative w-full sm:w-72 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-11 sm:h-10 w-full text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg font-medium placeholder:text-gray-400 shadow-sm focus:shadow-md transition-all"
                autoFocus
                aria-label="Search documents"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onShowSearchChange(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-1.5 flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:h-9 w-full sm:w-auto px-4 gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-semibold rounded-lg transition-all touch-manipulation min-h-[44px] sm:min-h-0"
              onClick={() => onShowSearchChange(true)}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
