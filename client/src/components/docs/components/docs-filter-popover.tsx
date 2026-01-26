import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X, Star, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function DocsFilterPopover({
  filters,
  onFiltersChange,
}: DocsFilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount =
    filters.categories.length +
    (filters.isFavoriteOnly ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 sm:h-9 px-3 sm:px-3.5 gap-2 text-xs sm:text-sm font-semibold transition-all rounded-lg whitespace-nowrap touch-manipulation",
            activeFilterCount > 0
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          )}
        >
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-extrabold rounded-full bg-blue-600 text-white shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-0 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Filters</span>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-[10px] font-medium text-red-500 hover:text-red-600 dark:text-red-400"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Content */}
        <div className="p-3 space-y-3">
          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</span>
            </div>
            <div className="space-y-0.5">
              {categoryOptions.map(option => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-all",
                    filters.categories.includes(option.value)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Checkbox
                    checked={filters.categories.includes(option.value)}
                    onCheckedChange={(checked) => handleCategoryChange(option.value, checked as boolean)}
                    className="h-3.5 w-3.5 rounded-sm border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className={cn(
                    "text-xs",
                    filters.categories.includes(option.value)
                      ? "text-blue-700 dark:text-blue-300 font-medium"
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
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</span>
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
                className="h-3.5 w-3.5 rounded-sm border-gray-300 dark:border-gray-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {dateRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleDateRangeChange(option.value as FilterState['dateRange'])}
                  className={cn(
                    "py-1.5 px-1 rounded text-[10px] font-medium transition-all",
                    filters.dateRange === option.value
                      ? "bg-blue-600 text-white"
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
        {activeFilterCount > 0 && (
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-300">
                {activeFilterCount} active
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
