import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

interface DocsEmptyStateProps {
  searchQuery: string;
  onCreateBlank: () => void;
  onCreateMeetingNotes: () => void;
}

export function DocsEmptyState({ searchQuery, onCreateBlank, onCreateMeetingNotes }: DocsEmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700/50 p-16 lg:p-24 text-center">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <FileText className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {searchQuery ? 'No documents found' : 'No documents yet'}
      </h3>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {searchQuery ? 'Try adjusting your search terms' : 'Create your first document to get started with your project documentation'}
      </p>
      {!searchQuery && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onCreateBlank}
            variant="outline"
            className="h-11 px-6 gap-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            Blank Document
          </Button>
          <Button
            onClick={onCreateMeetingNotes}
            className="h-11 px-6 gap-2 bg-blue-600 hover:bg-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Meeting Notes
          </Button>
        </div>
      )}
    </div>
  );
}
