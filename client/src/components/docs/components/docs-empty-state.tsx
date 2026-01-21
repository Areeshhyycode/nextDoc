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
      <div className="bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-12 lg:p-16 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          We couldn't find any documents matching "<span className="font-medium text-gray-700 dark:text-gray-300">{searchQuery}</span>". Try a different search term.
        </p>
      </div>
    );
  }

  // No documents empty state - ClickUp style
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-12 lg:p-20 text-center">
      {/* Illustration */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-2xl rotate-6"></div>
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <FileText className="h-10 w-10 text-blue-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Create your first Doc
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        Docs are great for wikis, meeting notes, project documentation, and more. Get started by creating your first document.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onCreateBlank}
          variant="outline"
          className="h-10 px-5 gap-2 font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Blank Document
        </Button>
        <Button
          onClick={onCreateMeetingNotes}
          className="h-10 px-5 gap-2 bg-blue-600 hover:bg-blue-700 font-medium"
        >
          <Plus className="h-4 w-4" />
          Meeting Notes
        </Button>
      </div>

      {/* Helpful tip */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
        💡 Tip: Use templates to quickly create structured documents
      </p>
    </div>
  );
}
