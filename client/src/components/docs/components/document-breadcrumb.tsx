import { ChevronRight, FileText, Home, Users, FolderOpen, CheckSquare } from "lucide-react";
import { Link } from "wouter";

interface DocumentBreadcrumbProps {
  title: string;
  isNewDoc?: boolean;
  category?: "blank" | "meeting_notes" | "project_overview" | "todo_list" | null;
  onNavigateBack?: () => void;
}

// Map category to display name and icon
const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof FileText }> = {
  blank: { label: "Documents", icon: FileText },
  meeting_notes: { label: "Meeting Notes", icon: Users },
  project_overview: { label: "Project Overview", icon: FolderOpen },
  todo_list: { label: "To-Do List", icon: CheckSquare },
};

export function DocumentBreadcrumb({
  title,
  isNewDoc = false,
  category,
  onNavigateBack,
}: DocumentBreadcrumbProps) {
  const displayTitle = title || (isNewDoc ? "New Document" : "Untitled Document");
  const categoryConfig = category ? CATEGORY_CONFIG[category] : null;

  return (
    <nav
      className="px-6 pt-3 pb-2 flex items-center gap-1.5 text-sm"
      aria-label="Breadcrumb"
    >
      {/* Home/Dashboard Link */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

      {/* Docs Link */}
      <button
        onClick={onNavigateBack}
        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        data-testid="breadcrumb-docs"
      >
        <FileText className="h-4 w-4" />
        <span>Docs</span>
      </button>

      {/* Category (if applicable) */}
      {categoryConfig && category !== "blank" && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <categoryConfig.icon className="h-4 w-4" />
            <span className="hidden md:inline">{categoryConfig.label}</span>
          </span>
        </>
      )}

      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

      {/* Current Document */}
      <span
        className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-md"
        title={displayTitle}
      >
        {isNewDoc && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mr-1">
            NEW
          </span>
        )}
        {displayTitle}
      </span>
    </nav>
  );
}
