import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { DocumentBreadcrumb } from "../components/document-breadcrumb";
import { EditorTopActions } from "../components/editor-top-actions";
import type { DocumentWithOwner } from "@shared/schema";

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
  onSave?: () => void;
  duplicateError?: { show: boolean; suggestedTitle?: string };
  titleRequiredError?: boolean;
  category?: "blank" | "meeting_notes" | "project_overview" | "todo_list" | null;
  document?: DocumentWithOwner | null;
  canEdit?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
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
  duplicateError,
  titleRequiredError,
  category,
  document,
  canEdit = true,
  onDuplicate,
  onDelete,
}: EditorHeaderProps) {
  // Use duplicateError from parent (from save attempt)
  const showWarning = duplicateError?.show || false;
  const suggestedTitle = duplicateError?.suggestedTitle;

  const handleUseSuggested = () => {
    if (suggestedTitle) {
      onTitleChange(suggestedTitle);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      {/* Breadcrumb and Top Actions */}
      <div className="flex items-center justify-between">
        <DocumentBreadcrumb
          title={title}
          isNewDoc={isNewDoc}
          category={category}
          onNavigateBack={onNavigateBack}
        />
        <div className="px-4 py-2">
          <EditorTopActions
            document={document || null}
            isNewDoc={isNewDoc}
            canEdit={canEdit}
            onClose={onNavigateBack}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onRename={onTitleChange}
          />
        </div>
      </div>

      {/* Title and Actions */}
      <div className="px-6 pb-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titleRequiredError ? "Enter a title..." : "Untitled"}
              className={`text-2xl font-bold border-0 focus-visible:ring-0 px-0 h-auto py-1 placeholder:text-gray-400 ${
                titleRequiredError ? "placeholder:text-red-400 dark:placeholder:text-red-500" :
                showWarning ? "text-amber-600 dark:text-amber-500" : ""
              }`}
              data-testid="input-doc-title"
            />
          </div>

          {/* Title Required Warning */}
          {titleRequiredError && (
            <div className="flex items-center gap-2 mt-1.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Please enter a document title</span>
            </div>
          )}

          {/* Duplicate Name Warning */}
          {showWarning && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  A document with this name already exists
                </p>
                {suggestedTitle && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                    Try using a different name to avoid confusion
                  </p>
                )}
              </div>
              {suggestedTitle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSuggested}
                  className="flex-shrink-0 text-xs h-7 px-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Use "{suggestedTitle}"
                </Button>
              )}
            </div>
          )}

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
