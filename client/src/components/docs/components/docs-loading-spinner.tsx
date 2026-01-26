export function DocsLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5" />
      <p className="text-base text-gray-500 dark:text-gray-400">Loading documents...</p>
    </div>
  );
}
