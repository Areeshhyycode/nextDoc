import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { SelectedFilePreview } from "./selected-file-preview";

interface ValidationResult {
  isValid: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  message?: string;
  error?: string;
}

interface FileDropZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  dragActive: boolean;
  onDragStateChange: (active: boolean) => void;
  acceptedTypes?: string;
  isValidating?: boolean;
  validationResult?: ValidationResult | null;
}

// Allowed file extensions
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

// Get file extension
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? "." + parts.pop()?.toLowerCase() : "";
}

// Check if file type is valid
function isValidFileType(file: File): { valid: boolean; error?: string } {
  const extension = getFileExtension(file.name);

  if (extension === ".doc") {
    return {
      valid: false,
      error: "Old .doc format is not supported. Please convert to .docx"
    };
  }

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Only PDF and DOCX files are allowed. You selected a '${extension || "unknown"}' file.`
    };
  }

  return { valid: true };
}

export function FileDropZone({
  selectedFile,
  onFileSelect,
  onFileRemove,
  dragActive,
  onDragStateChange,
  acceptedTypes = ".pdf,.docx",
  isValidating = false,
  validationResult = null,
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  // Validate file on client side before sending to server
  const validateAndSelectFile = useCallback((file: File) => {
    setClientError(null);

    const validation = isValidFileType(file);
    if (!validation.valid) {
      setClientError(validation.error || "Invalid file type");
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // File is valid, proceed with selection
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      onDragStateChange(true);
    } else if (e.type === "dragleave") {
      onDragStateChange(false);
    }
  }, [onDragStateChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  }, [onDragStateChange, validateAndSelectFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onFileRemove();
    setClientError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clear client error when user dismisses it
  const clearClientError = () => {
    setClientError(null);
  };

  // Determine border color based on validation state
  const getBorderClass = () => {
    if (clientError) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    if (dragActive) {
      return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
    if (isValidating) {
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    }
    if (validationResult?.isValid) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    if (validationResult && !validationResult.isValid) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    return "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500";
  };

  return (
    <div className="px-8 mb-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${getBorderClass()}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Client-side error message (shows when invalid file type selected) */}
        {clientError && !selectedFile && (
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
            <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium mb-2">
              {clientError}
            </p>
            <button
              onClick={clearClientError}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {selectedFile ? (
          <div className="space-y-3">
            <SelectedFilePreview file={selectedFile} onRemove={handleRemove} />

            {/* Validation Status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              {isValidating && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">Validating file...</span>
                </>
              )}
              {validationResult?.isValid && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">File validated successfully</span>
                </>
              )}
              {validationResult && !validationResult.isValid && (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">{validationResult.error}</span>
                </>
              )}
            </div>
          </div>
        ) : !clientError && (
          <div className="flex flex-col items-center">
            <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop a file or{" "}
              <button
                onClick={handleBrowseClick}
                className="text-gray-900 dark:text-white underline hover:no-underline font-medium"
              >
                browse
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
