import { Button } from "@/components/ui/button";
import {
  FileText,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import type { TemplatePage } from "./types";

interface TemplateFooterProps {
  selectedPage: TemplatePage | null;
  documentId?: string | null;
  onAddPage?: (title: string) => Promise<void>;
  isAddingPage: boolean;
  onUseTemplate: () => void;
}

export function TemplateFooter({
  selectedPage,
  documentId,
  onAddPage,
  isAddingPage,
  onUseTemplate,
}: TemplateFooterProps) {
  return (
    <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#16181c]">
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-[13px] md:text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedPage?.content.heading}
            </p>
            <p className="text-[10px] sm:text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
              Ready to create
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {documentId && onAddPage && (
            <Button
              onClick={() => {
                if (selectedPage) {
                  onAddPage(selectedPage.content.heading);
                }
              }}
              disabled={isAddingPage || !selectedPage}
              variant="outline"
              className="h-8 sm:h-9 px-2 sm:px-3 md:px-4 text-[11px] sm:text-xs md:text-sm border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              {isAddingPage ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              )}
              <span className="hidden sm:inline">Add as Page</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
          <Button
            onClick={onUseTemplate}
            className="h-8 sm:h-9 px-3 sm:px-4 md:px-6 text-[11px] sm:text-xs md:text-sm bg-teal-600 hover:bg-teal-700 text-white"
          >
            <span className="hidden sm:inline">Use Template</span>
            <span className="sm:hidden">Use</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5 md:ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
