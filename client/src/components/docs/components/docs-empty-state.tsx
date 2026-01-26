import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, Sparkles } from "lucide-react";

interface DocsEmptyStateProps {
  searchQuery: string;
  onCreateBlank: () => void;
  onCreateMeetingNotes: () => void;
}

export function DocsEmptyState({ searchQuery, onCreateBlank, onCreateMeetingNotes }: DocsEmptyStateProps) {
  // Search results empty state
  if (searchQuery) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/50 p-12 sm:p-14 lg:p-18 text-center shadow-lg shadow-gray-100/50 dark:shadow-gray-900/50">
        <div className="w-20 h-20 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-6 shadow-sm">
          <Search className="h-9 w-9 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 className="text-xl sm:text-xl font-extrabold text-gray-900 dark:text-white mb-3">
          No results found
        </h3>
        <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto px-3 font-semibold leading-relaxed">
          We couldn't find any documents matching "<span className="font-extrabold text-gray-900 dark:text-white">{searchQuery}</span>". Try a different search term.
        </p>
      </div>
    );
  }

  // No documents empty state - ClickUp style
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/50 p-12 sm:p-14 lg:p-24 text-center shadow-xl shadow-gray-100/50 dark:shadow-gray-900/50">
      {/* Illustration */}
      <div className="relative w-28 h-28 sm:w-28 sm:h-28 mx-auto mb-7 sm:mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-2xl rotate-6 shadow-lg"></div>
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-xl">
          <FileText className="h-12 w-12 sm:h-12 sm:w-12 text-blue-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/20 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="h-5 w-5 sm:h-5 sm:w-5 text-yellow-500 animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-2xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
        Create your first Doc
      </h3>
      <p className="text-[13px] sm:text-base text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-sm mx-auto leading-relaxed px-4 font-semibold">
        Docs are great for wikis, meeting notes, project documentation, and more.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-3 sm:px-0">
        <Button
          onClick={onCreateBlank}
          variant="outline"
          className="w-full sm:w-auto h-12 sm:h-12 px-6 gap-2 font-bold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition-all touch-manipulation"
        >
          <Plus className="h-4.5 w-4.5" />
          Blank Document
        </Button>
        <Button
          onClick={onCreateMeetingNotes}
          className="w-full sm:w-auto h-12 sm:h-12 px-6 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-bold text-sm shadow-lg hover:shadow-xl active:scale-[0.98] transition-all touch-manipulation"
        >
          <Plus className="h-4.5 w-4.5" />
          Meeting Notes
        </Button>
      </div>

      {/* Helpful tip */}
      <div className="mt-8 sm:mt-10 inline-flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 rounded-xl">
        <span className="text-xl">💡</span>
        <p className="text-[12px] sm:text-sm text-gray-700 dark:text-gray-300 font-bold">
          Tip: Use templates to get started quickly
        </p>
      </div>
    </div>
  );
}
