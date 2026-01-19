export function EditorLoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Loading document...
        </p>
      </div>
    </div>
  );
}
