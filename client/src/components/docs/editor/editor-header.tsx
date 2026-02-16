import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { DocumentBreadcrumb } from "../components/document-breadcrumb";
import { EditorTopActions } from "../components/editor-top-actions";
import { ActiveUsers } from "../components/active-users";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import type { DocumentWithOwner } from "@shared/schema";
import type { CollaborationUser } from "@/hooks/use-collaboration";

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onNavigateBack: () => void;
  isNewDoc: boolean;
  isSaving: boolean;
  isPending: boolean;
  lastSavedAt: Date | null;
  documentUpdatedAt?: Date | string | null;
  onSave?: () => void;
  duplicateError?: { show: boolean; suggestedTitle?: string };
  titleRequiredError?: boolean;
  category?: "blank" | "meeting_notes" | "project_overview" | "todo_list" | null;
  document?: DocumentWithOwner | null;
  canEdit?: boolean;
  isOwner?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  connectedUsers?: CollaborationUser[];
  isCollaborationConnected?: boolean;
}

export function EditorHeader({
  title,
  onTitleChange,
  onNavigateBack,
  isNewDoc,
  isSaving,
  isPending,
  lastSavedAt,
  documentUpdatedAt,
  onSave,
  duplicateError,
  titleRequiredError,
  category,
  document,
  canEdit = true,
  isOwner = true,
  onDuplicate,
  onDelete,
  connectedUsers = [],
  isCollaborationConnected = false,
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
    <div className="bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-10">
      {/* Breadcrumb and Top Actions */}
      <div className="flex items-center justify-between min-w-0">
        <DocumentBreadcrumb
          title={title}
          isNewDoc={isNewDoc}
          category={category}
          onNavigateBack={onNavigateBack}
        />
        <div className="px-1 sm:px-4 py-1.5 sm:py-2 flex-shrink-0">
          <EditorTopActions
            document={document || null}
            isNewDoc={isNewDoc}
            canEdit={canEdit}
            onClose={onNavigateBack}
            onDuplicate={onDuplicate}
            onDelete={isOwner ? onDelete : undefined}
            onRename={isOwner ? onTitleChange : undefined}
          />
        </div>
      </div>

      {/* Title and Actions */}
      <div className="px-3 sm:px-6 pb-2 sm:pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titleRequiredError ? "Enter a title..." : "Untitled"}
              className={`text-lg sm:text-2xl font-bold border-0 focus-visible:ring-0 px-0 h-auto py-1 placeholder:text-gray-400 ${
                titleRequiredError ? "placeholder:text-red-400 dark:placeholder:text-red-500" :
                showWarning ? "text-amber-600 dark:text-amber-500" : ""
              } ${!isOwner ? "cursor-not-allowed text-gray-500" : ""}`}
              readOnly={!isOwner}
              data-testid="input-doc-title"
            />
          </div>

          {/* Title Required Warning */}
          {titleRequiredError && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span>Please enter a document title</span>
            </div>
          )}

          {/* Duplicate Name Warning */}
          {showWarning && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1.5 sm:mt-2 p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium">
                    A document with this name already exists
                  </p>
                  {suggestedTitle && (
                    <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      Try using a different name to avoid confusion
                    </p>
                  )}
                </div>
              </div>
              {suggestedTitle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSuggested}
                  className="flex-shrink-0 text-[10px] sm:text-xs h-6 sm:h-7 px-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Use "{suggestedTitle}"
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {/* Active collaboration users */}
            {!isNewDoc && (connectedUsers.length > 0 || isCollaborationConnected) && (
              <ActiveUsers users={connectedUsers} isConnected={isCollaborationConnected} />
            )}
            {lastSavedAt && !isNewDoc && (
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
            {!isNewDoc && documentUpdatedAt && wasUpdated(document?.createdAt || null, documentUpdatedAt) && (
              <span className="flex items-center gap-1">
                {lastSavedAt && <span className="text-gray-300 dark:text-gray-600">•</span>}
                <span>
                  Last updated {formatRelativeTime(documentUpdatedAt)}
                </span>
                {document?.lastUpdater && (
                  <span className="text-gray-400 dark:text-gray-500">
                    by {document.lastUpdater.displayName}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isNewDoc && (
            <Button
              onClick={onSave}
              disabled={isPending}
              data-testid="button-save-doc"
              className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
            >
              {isPending ? "Creating..." : "Create Document"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
