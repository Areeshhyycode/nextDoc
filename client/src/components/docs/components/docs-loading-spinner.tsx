import { DocumentsTableSkeleton } from "./documents-skeleton";

interface DocsLoadingSpinnerProps {
  message?: string;
  useSkeleton?: boolean;
}

/**
 * Loading state for the documents page
 * Can show either a skeleton loader or a simple spinner
 */
export function DocsLoadingSpinner({
  message = "Loading documents...",
  useSkeleton = true
}: DocsLoadingSpinnerProps) {
  if (useSkeleton) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <DocumentsTableSkeleton count={6} />
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-col items-center justify-center py-32"
    >
      <div
        className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-5"
        aria-hidden="true"
      />
      <p className="text-base text-gray-500 dark:text-gray-400">{message}</p>
      <span className="sr-only">Please wait while content is loading</span>
    </div>
  );
}
