import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";

interface DocsEmptyStateProps {
  searchQuery: string;
  onCreateBlank: () => void;
  onCreateMeetingNotes: () => void;
}

export function DocsEmptyState({ searchQuery, onCreateBlank, onCreateMeetingNotes }: DocsEmptyStateProps) {
  if (searchQuery) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-12 sm:p-16 text-center">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          No documents matching "<span className="font-medium text-gray-700 dark:text-gray-300">{searchQuery}</span>". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900/30 p-12 sm:p-20 text-center">
      {/* Icon */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 rounded-2xl rotate-3"></div>
        <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
          <FileText className="h-9 w-9 text-teal-500" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Create your first document
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
        Docs are great for wikis, meeting notes, project documentation, and more.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onCreateBlank}
          variant="outline"
          className="h-10 px-5 gap-2 font-medium border-gray-200 dark:border-gray-700 text-sm"
        >
          <Plus className="h-4 w-4" />
          Blank Document
        </Button>
        <Button
          onClick={onCreateMeetingNotes}
          className="h-10 px-5 gap-2 bg-teal-600 hover:bg-teal-700 font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Meeting Notes
        </Button>
      </div>
    </div>
  );
}
