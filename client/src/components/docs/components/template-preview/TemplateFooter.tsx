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
    <div className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#16181c]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {selectedPage?.content.heading}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Ready to create
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {documentId && onAddPage && (
            <Button
              onClick={() => {
                if (selectedPage) {
                  onAddPage(selectedPage.content.heading);
                }
              }}
              disabled={isAddingPage || !selectedPage}
              variant="outline"
              className="flex-1 sm:flex-none h-8 sm:h-9 px-2 sm:px-4 text-[11px] sm:text-sm border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              {isAddingPage ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              )}
              Add as Page
            </Button>
          )}
          <Button
            onClick={onUseTemplate}
            className="flex-1 sm:flex-none h-8 sm:h-9 px-3 sm:px-6 text-[11px] sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Use Template
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
