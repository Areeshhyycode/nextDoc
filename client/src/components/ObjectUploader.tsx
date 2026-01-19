import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (files: Array<{ name: string; size: number; uploadURL: string }>) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 10,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "default",
  children,
}: ObjectUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    console.log("Files selected:", files.length);
    
    if (files.length === 0) return;
    
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too many files",
        description: `Please select up to ${maxNumberOfFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        try {
          const params = await onGetUploadParameters();
          console.log("Upload params:", params);
          
          if (!params || !params.url) {
            throw new Error("Invalid upload parameters received");
          }
          
          const uploadUrl = params.url;
          
          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
          }

          // Remove query params from URL to get the base object URL
          const baseUrl = uploadUrl.includes("?") ? uploadUrl.split("?")[0] : uploadUrl;

          uploadedFiles.push({
            name: file.name,
            size: file.size,
            uploadURL: baseUrl,
          });
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          throw fileError;
        }
      }

      onComplete?.(uploadedFiles);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button 
        onClick={() => {
          console.log("Upload button clicked, triggering file input");
          fileInputRef.current?.click();
        }} 
        className={buttonClassName} 
        variant={buttonVariant}
        disabled={isUploading}
        type="button"
      >
        {isUploading ? "Uploading..." : children}
      </Button>
    </div>
  );
}
