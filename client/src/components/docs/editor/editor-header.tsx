import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onNavigateBack: () => void;
  isNewDoc: boolean;
  isSaving: boolean;
  isPending: boolean;
  lastSavedAt: Date | null;
  showLastModified: boolean;
  documentUpdatedAt?: Date | string | null;
  onSave: () => void;
}

export function EditorHeader({
  title,
  onTitleChange,
  onNavigateBack,
  isNewDoc,
  isSaving,
  isPending,
  lastSavedAt,
  showLastModified,
  documentUpdatedAt,
  onSave,
}: EditorHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <button
          onClick={onNavigateBack}
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
          data-testid="breadcrumb-docs"
        >
          Docs
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-md">
          {title || "Untitled Document"}
        </span>
      </div>

      {/* Title and Actions */}
      <div className="px-6 pb-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled"
            className="text-2xl font-bold border-0 focus-visible:ring-0 px-0 h-auto py-1 placeholder:text-gray-400"
            data-testid="input-doc-title"
          />
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {lastSavedAt && !isNewDoc && showLastModified && (
              <span data-testid="last-saved-indicator">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Saved at {format(lastSavedAt, "h:mm a")}
                  </span>
                )}
              </span>
            )}
            {documentUpdatedAt && showLastModified && (
              <span>
                Last updated{" "}
                {format(new Date(documentUpdatedAt), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isNewDoc && (
            <Button
              onClick={onSave}
              disabled={isPending}
              data-testid="button-save-doc"
            >
              {isPending ? "Creating..." : "Create Document"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
