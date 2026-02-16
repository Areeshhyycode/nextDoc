import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, ArrowUpDown, Check, ArrowUp, ArrowDown, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'created_at', label: 'Date created' },
  { field: 'updated_at', label: 'Date updated' },
  { field: 'viewed_at', label: 'Date viewed' },
  { field: 'owner', label: 'Owner' },
] as const;

function SortContent({
  sortField,
  sortDirection,
  onSortChange,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}) {
  return (
    <div className="py-1">
      <div className="px-3 py-2">
        <p className="text-xs text-gray-400 font-medium">Sort by</p>
      </div>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.field}
          onClick={() => onSortChange(option.field, sortDirection)}
          className={cn(
            "w-full flex items-center justify-between gap-3 py-2.5 px-3 text-left transition-colors",
            sortField === option.field
              ? "bg-gray-50 dark:bg-gray-800/50"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
        >
          <span className="text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
          {sortField === option.field && (
            <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
          )}
        </button>
      ))}
      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
      <div className="px-3 py-2">
        <p className="text-xs text-gray-400 font-medium">Direction</p>
      </div>
      <button
        onClick={() => onSortChange(sortField, 'asc')}
        className={cn(
          "w-full flex items-center justify-between gap-3 py-2.5 px-3 text-left transition-colors",
          sortDirection === 'asc'
            ? "bg-gray-50 dark:bg-gray-800/50"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
      >
        <div className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Ascending</span>
        </div>
        {sortDirection === 'asc' && (
          <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
        )}
      </button>
      <button
        onClick={() => onSortChange(sortField, 'desc')}
        className={cn(
          "w-full flex items-center justify-between gap-3 py-2.5 px-3 text-left transition-colors",
          sortDirection === 'desc'
            ? "bg-gray-50 dark:bg-gray-800/50"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
      >
        <div className="flex items-center gap-2">
          <ArrowDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Descending</span>
        </div>
        {sortDirection === 'desc' && (
          <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
        )}
      </button>
    </div>
  );
}

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
  const [sortOpen, setSortOpen] = useState(false);
  const isMobile = useIsMobile();
  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find(opt => opt.field === sortField)?.label || 'Sort',
    [sortField]
  );

  const sortTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 px-3 gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      aria-label={`Sort by ${currentSortLabel}, ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
    >
      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sm:hidden">Sort: {currentSortLabel}</span>
      <span className="hidden sm:inline">Sort</span>
    </Button>
  );

  return (
    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800/60">
      <DocsFilterPopover
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      {isMobile ? (
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <div className="flex-1" onClick={() => setSortOpen(true)}>
            {sortTrigger}
          </div>
          <SheetContent
            side="bottom"
            className="p-0 rounded-t-xl max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900"
          >
            <SheetTitle className="sr-only">Sort</SheetTitle>
            <SortContent
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={(field, dir) => {
                onSortChange(field, dir);
                setSortOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {sortTrigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 p-1">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 font-medium">Sort by</p>
            </div>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.field}
                onClick={() => onSortChange(option.field, sortDirection)}
                className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between"
              >
                <span className="text-sm">{option.label}</span>
                {sortField === option.field && (
                  <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 font-medium">Direction</p>
            </div>
            <DropdownMenuItem
              onClick={() => onSortChange(sortField, 'asc')}
              className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Ascending</span>
              </div>
              {sortDirection === 'asc' && (
                <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(sortField, 'desc')}
              className="gap-3 py-2 px-3 rounded-md cursor-pointer justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Descending</span>
              </div>
              {sortDirection === 'desc' && (
                <Check className="h-4 w-4 text-teal-500" aria-label="Selected" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex-1 sm:flex-none sm:ml-auto">
        {showSearch ? (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-teal-400 dark:focus:border-teal-500 rounded-lg font-medium placeholder:text-gray-400"
              autoFocus
              aria-label="Search documents"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onShowSearchChange(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => onShowSearchChange(true)}
            aria-label="Open search"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search</span>
          </Button>
        )}
      </div>
    </div>
  );
}
