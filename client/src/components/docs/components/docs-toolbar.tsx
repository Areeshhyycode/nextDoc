import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ArrowUpDown, Check, ArrowUp, ArrowDown } from "lucide-react";

export type SortField = 'name' | 'created_at' | 'updated_at' | 'owner';
export type SortDirection = 'asc' | 'desc';

interface DocsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onShowSearchChange: (show: boolean) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'created_at', label: 'Date created' },
  { field: 'updated_at', label: 'Date updated' },
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
}: DocsToolbarProps) {
  const currentSortLabel = sortOptions.find(opt => opt.field === sortField)?.label || 'Sort';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700/50">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Filter</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
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
      <div className="flex items-center gap-1 sm:gap-2">
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 sm:pl-10 h-8 sm:h-9 w-32 sm:w-48 md:w-64 lg:w-80 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
              autoFocus
              onBlur={() => !searchQuery && onShowSearchChange(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
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
