import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUpDown, Check, ArrowUp, ArrowDown, X } from "lucide-react";
import { DocsFilterPopover, type FilterState } from "./docs-filter-popover";

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

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'created_at', label: 'Date created' },
  { field: 'updated_at', label: 'Date updated' },
  { field: 'viewed_at', label: 'Date viewed' },
  { field: 'owner', label: 'Owner' },
];

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
  const currentSortLabel = sortOptions.find(opt => opt.field === sortField)?.label || 'Sort';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-gray-100 dark:border-gray-800/50">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <DocsFilterPopover
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 sm:h-9 px-3 sm:px-3.5 gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all touch-manipulation"
            >
              <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 p-1">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 font-medium">Sort by</p>
            </div>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.field}
                onClick={() => onSortChange(option.field, sortDirection)}
                className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between"
              >
                <span className="text-sm">{option.label}</span>
                {sortField === option.field && (
                  <Check className="h-4 w-4 text-blue-500" />
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
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">Ascending</span>
              </div>
              {sortDirection === 'asc' && (
                <Check className="h-4 w-4 text-blue-500" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(sortField, 'desc')}
              className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">Descending</span>
              </div>
              {sortDirection === 'desc' && (
                <Check className="h-4 w-4 text-blue-500" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {showSearch ? (
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 sm:pl-10 pr-10 h-10 sm:h-10 w-full sm:w-56 md:w-72 lg:w-96 text-xs sm:text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg font-medium placeholder:text-gray-400 shadow-sm focus:shadow-md transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onShowSearchChange(false);
                }}
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation"
              >
                <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 sm:h-9 px-3 sm:px-3.5 gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all touch-manipulation"
            onClick={() => onShowSearchChange(true)}
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Search</span>
          </Button>
        )}
      </div>
    </div>
  );
}
