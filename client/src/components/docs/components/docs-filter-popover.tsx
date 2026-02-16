import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Filter, X, Star, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FilterState {
  categories: string[];
  isFavoriteOnly: boolean;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export const defaultFilterState: FilterState = {
  categories: [],
  isFavoriteOnly: false,
  dateRange: 'all',
};

interface DocsFilterPopoverProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const categoryOptions = [
  { value: 'blank', label: 'Blank' },
  { value: 'meeting_notes', label: 'Meeting Notes' },
  { value: 'project_overview', label: 'Project Overview' },
];

const dateRangeOptions = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
];

function FilterContent({
  filters,
  onFiltersChange,
  activeFilterCount,
  onClose,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  activeFilterCount: number;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDateRangeChange = (range: FilterState['dateRange']) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const handleFavoriteChange = (checked: boolean) => {
    onFiltersChange({ ...filters, isFavoriteOnly: checked });
  };

  const clearAllFilters = () => {
    onFiltersChange(defaultFilterState);
  };

  return (
    <>
      {/* Header with drag handle for mobile */}
      {isMobile && (
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      )}
      <div className={cn(
        "flex items-center justify-between border-b border-gray-200 dark:border-gray-700",
        isMobile
          ? "px-4 py-2.5"
          : "px-3 py-2 bg-gray-50 dark:bg-gray-800/50"
      )}>
        <span className={cn(
          "font-semibold text-gray-700 dark:text-gray-200",
          isMobile ? "text-sm" : "text-xs"
        )}>Filters</span>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className={cn(
                "flex items-center gap-1 font-medium text-red-500 hover:text-red-600 dark:text-red-400",
                isMobile ? "text-xs" : "text-[10px]"
              )}
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close filters"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className={cn(
        "space-y-2.5",
        isMobile ? "px-4 py-3" : "p-3 space-y-3"
      )}>
        {/* Category Filter */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</span>
          </div>
          <div className="space-y-0.5">
            {categoryOptions.map(option => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-2 rounded cursor-pointer transition-all",
                  isMobile ? "py-1.5 px-2" : "py-1.5 px-2",
                  filters.categories.includes(option.value)
                    ? "bg-teal-50 dark:bg-teal-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <Checkbox
                  checked={filters.categories.includes(option.value)}
                  onCheckedChange={(checked) => handleCategoryChange(option.value, checked as boolean)}
                  className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                />
                <span className={cn(
                  "text-xs",
                  filters.categories.includes(option.value)
                    ? "text-teal-700 dark:text-teal-300 font-medium"
                    : "text-gray-600 dark:text-gray-300"
                )}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Favorites Filter */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
          </div>
          <label
            className={cn(
              "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-all",
              filters.isFavoriteOnly
                ? "bg-amber-50 dark:bg-amber-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
          >
            <Checkbox
              checked={filters.isFavoriteOnly}
              onCheckedChange={(checked) => handleFavoriteChange(checked as boolean)}
              className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <Star className={cn(
              "h-3 w-3",
              filters.isFavoriteOnly ? "text-amber-500 fill-amber-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs",
              filters.isFavoriteOnly
                ? "text-amber-700 dark:text-amber-300 font-medium"
                : "text-gray-600 dark:text-gray-300"
            )}>
              Favorites only
            </span>
          </label>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Date Range Filter */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value as FilterState['dateRange'])}
                className={cn(
                  "py-1.5 px-1 rounded text-[10px] font-medium transition-all",
                  filters.dateRange === option.value
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {isMobile ? (
        <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            className="w-full h-9 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-white/20">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      ) : activeFilterCount > 0 ? (
        <div className="px-3 py-2 bg-teal-50 dark:bg-teal-900/10 border-t border-teal-100 dark:border-teal-900/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-teal-600 dark:text-teal-300">
              {activeFilterCount} active
            </p>
            <button
              onClick={onClose}
              className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DocsFilterPopover({
  filters,
  onFiltersChange,
}: DocsFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const activeFilterCount =
    filters.categories.length +
    (filters.isFavoriteOnly ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0);

  const triggerButton = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 sm:h-9 px-3 sm:px-3.5 gap-2 text-xs sm:text-sm font-semibold transition-all rounded-lg whitespace-nowrap touch-manipulation",
        activeFilterCount > 0
          ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-2 border-teal-300 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-600"
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      )}
    >
      <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span>Filter</span>
      {activeFilterCount > 0 && (
        <span className="ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-extrabold rounded-full bg-teal-600 text-white shadow-sm">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );

  const filterContent = (
    <FilterContent
      filters={filters}
      onFiltersChange={onFiltersChange}
      activeFilterCount={activeFilterCount}
      onClose={() => setOpen(false)}
    />
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>
          {triggerButton}
        </div>
        <SheetContent
          side="bottom"
          className="p-0 pb-2 rounded-t-2xl max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-900 [&>button:last-child]:hidden"
        >
          <SheetTitle className="sr-only">Filters</SheetTitle>
          {filterContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-0 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
      >
        {filterContent}
      </PopoverContent>
    </Popover>
  );
}
