import { FileText, X } from "lucide-react";

interface SelectedFilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function SelectedFilePreview({ file, onRemove }: SelectedFilePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 max-w-full truncate px-2">
        {file.name}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
        {(file.size / 1024).toFixed(1)} KB
      </p>
      <button
        onClick={onRemove}
        className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
      >
        <X className="h-4 w-4" />
        Remove
      </button>
    </div>
  );
}
