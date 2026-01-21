import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

// Components
import { ImportModalHeader } from "./import-modal-header";
import { InfoBanner } from "./info-banner";
import { FileDropZone } from "./file-drop-zone";
import { ImportModalFooter } from "./import-modal-footer";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Validation response type
interface ValidationResponse {
  isValid: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  message?: string;
  error?: string;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  // API 1: Validate file
  const validateMutation = useMutation({
    mutationFn: async (file: File): Promise<ValidationResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/docs/validate", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isValid: false,
          fileName: file.name,
          fileSize: file.size,
          error: data.error || "Validation failed"
        };
      }

      return data as ValidationResponse;
    },
    onSuccess: (result) => {
      setValidationResult(result);
      setIsValidating(false);

      if (result.isValid) {
        toast({
          title: "File validated",
          description: `${result.fileName} is ready to import`
        });
      } else {
        toast({
          title: "Invalid file",
          description: result.error,
          variant: "destructive"
        });
        setSelectedFile(null);
      }
    },
    onError: (error) => {
      setIsValidating(false);
      setValidationResult(null);
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    },
  });

  // API 2: Import file
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/docs/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import document");
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (newDoc: Document) => {
      queryClient.invalidateQueries({ predicate: (query) =>
        typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/docs')
      });
      toast({ title: "Document imported successfully" });
      handleClose();
      navigate(`/docs/${newDoc.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Failed to import document",
        description: errorMessage,
        variant: "destructive"
      });
      setIsUploading(false);
      // Reset file selection so user can try again
      setSelectedFile(null);
      setValidationResult(null);
    },
  });

  // Handle file selection - validate immediately
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValidationResult(null);
    setIsValidating(true);
    validateMutation.mutate(file);
  };

  // Handle import button click
  const handleNext = () => {
    if (selectedFile && validationResult?.isValid) {
      setIsUploading(true);
      importMutation.mutate(selectedFile);
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null);
    setValidationResult(null);
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setIsValidating(false);
    setValidationResult(null);
    setDragActive(false);
    onClose();
  };

  // Determine button state
  const isButtonDisabled = !selectedFile || isValidating || !validationResult?.isValid;
  const isLoading = isUploading || isValidating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <VisuallyHidden>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>Upload a PDF or DOCX file to import as a document</DialogDescription>
        </VisuallyHidden>
        <ImportModalHeader title="Select a file to upload" />

        <InfoBanner
          message="Imported Docs will be visible to everyone in your Workspace. You can change who has access after import."
          learnMoreUrl="#"
        />

        <FileDropZone
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          dragActive={dragActive}
          onDragStateChange={setDragActive}
          isValidating={isValidating}
          validationResult={validationResult}
        />

        {/* Supported Types */}
        <div className="px-8 mb-8">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supported file types: .pdf, .docx
          </p>
        </div>

        <ImportModalFooter
          onNext={handleNext}
          disabled={isButtonDisabled}
          isLoading={isLoading}
          loadingText={isValidating ? "Validating..." : "Importing..."}
        />
      </DialogContent>
    </Dialog>
  );
}
