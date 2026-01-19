import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface DocsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showSearch: boolean;
  onShowSearchChange: (show: boolean) => void;
}

export function DocsToolbar({
  searchQuery,
  onSearchChange,
  showSearch,
  onShowSearchChange,
}: DocsToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/50">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 w-80 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
              autoFocus
              onBlur={() => !searchQuery && onShowSearchChange(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => onShowSearchChange(true)}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        )}
      </div>
    </div>
  );
}
