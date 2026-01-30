import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { RichTextEditor } from "@/components/docs/components/rich-text-editor";
import { FileText, Globe, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PublicDocument {
  id: string;
  title: string;
  content: string;
  pageStyles: {
    fontStyle: "system" | "serif" | "mono";
    fontSize: "small" | "default" | "large";
    pageWidth: "default" | "full";
    showLastModified: boolean;
  };
  updatedAt: string;
  ownerName: string;
}

export default function PublicDocViewerPage() {
  const params = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const token = params.token;

  const { data: document, isLoading, error } = useQuery<PublicDocument>({
    queryKey: [`/api/public/docs/${token}`],
    queryFn: async () => {
      const response = await fetch(`/api/public/docs/${token}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to load document");
      }
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  // Style helper functions
  const getFontClass = () => {
    if (!document?.pageStyles) return "";
    const fontMap = {
      system: "",
      serif: "font-serif",
      mono: "font-mono",
    };
    return fontMap[document.pageStyles.fontStyle] || "";
  };

  const getFontSizeClass = () => {
    if (!document?.pageStyles) return "text-base";
    const sizeMap = {
      small: "text-sm",
      default: "text-base",
      large: "text-lg",
    };
    return sizeMap[document.pageStyles.fontSize] || "text-base";
  };

  const getWidthClass = () => {
    if (!document?.pageStyles) return "max-w-4xl";
    const widthMap = {
      default: "max-w-4xl",
      full: "max-w-full px-8",
    };
    return widthMap[document.pageStyles.pageWidth] || "max-w-4xl";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Document Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error instanceof Error ? error.message : "This document may have been deleted or the public link has been disabled."}
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(document.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[300px] sm:max-w-[500px]">
                {document.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>By {document.ownerName}</span>
                <span>·</span>
                <span>Updated {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Public badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            <Globe className="h-3.5 w-3.5" />
            <span>Public Document</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle watermark overlay */}
        <div
          className="fixed bottom-20 right-4 z-20 pointer-events-none select-none opacity-40"
          aria-hidden="true"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
            <Globe className="h-3 w-3" />
            <span>Shared publicly by {document.ownerName}</span>
          </div>
        </div>

        <div className={cn("mx-auto py-8 px-4", getWidthClass())}>
          {/* Read-only content wrapper - prevents text selection and interactions */}
          <div
            className={cn(
              getFontClass(),
              getFontSizeClass(),
              "select-none" // Prevent text selection for cleaner read-only experience
            )}
            onCopy={(e) => {
              // Allow copy but add attribution
              const selection = window.getSelection()?.toString() || "";
              if (selection) {
                e.clipboardData?.setData(
                  "text/plain",
                  `${selection}\n\n— Shared from "${document.title}" by ${document.ownerName} via NexusTrack Docs`
                );
                e.preventDefault();
              }
            }}
          >
            <RichTextEditor
              content={document.content}
              onChange={() => {}}
              editable={false}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <span>Shared via NexusTrack Docs</span>
        </div>
      </footer>
    </div>
  );
}
