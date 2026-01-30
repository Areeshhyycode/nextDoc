import {
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplatePage, TemplateData } from "./types";

interface TemplateContentProps {
  template: TemplateData;
  selectedPage: TemplatePage | null;
  sidebarCollapsed: boolean;
  isAnimating: boolean;
  onClose: () => void;
  onExpandSidebar: () => void;
}

export function TemplateContent({
  template,
  selectedPage,
  sidebarCollapsed,
  isAnimating,
  onClose,
  onExpandSidebar,
}: TemplateContentProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1a1d21] relative">
      {/* Top bar */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expand sidebar button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={onExpandSidebar}
          className="absolute top-3 left-3 z-20 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden md:flex"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        isAnimating ? "opacity-50" : "opacity-100"
      )}>
        <div className="max-w-2xl mx-auto px-3 sm:px-8 py-4 sm:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-2 sm:mb-4">
            <span>{template.name}</span>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-gray-600 dark:text-gray-300">{selectedPage?.title}</span>
          </div>

          {/* Page Heading */}
          <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            {selectedPage?.content.heading}
          </h1>

          {/* Description */}
          {selectedPage?.content.description && (
            <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-8">
              {selectedPage.content.description}
            </p>
          )}

          {/* Callout Box */}
          {selectedPage?.content.callout && (
            <div className="bg-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-5 mb-4 sm:mb-8">
              <h3 className="font-semibold text-white mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                {selectedPage.content.callout.title}
              </h3>
              <ul className="space-y-1.5 sm:space-y-3">
                {selectedPage.content.callout.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 sm:gap-3 text-white/90 text-[10px] sm:text-sm"
                  >
                    <span className="mt-1 sm:mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          {selectedPage?.content.sections && (
            <div className="space-y-3 sm:space-y-6">
              {selectedPage.content.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500" />
                    {section.title}
                  </h3>
                  {section.content && (
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {section.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
