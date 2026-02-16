import { useRef, useEffect } from "react";
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
  pages: TemplatePage[];
  selectedPageId: string;
  onSelectPage: (id: string) => void;
}

export function TemplateContent({
  template,
  selectedPage,
  sidebarCollapsed,
  isAnimating,
  onClose,
  onExpandSidebar,
  pages,
  selectedPageId,
  onSelectPage,
}: TemplateContentProps) {
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileNavRef.current) {
      const activeBtn = mobileNavRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedPageId]);
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1a1d21] relative">
      {/* Top bar */}
      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-20">
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
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

      {/* Mobile page selector - only visible below md breakpoint */}
      <div
        className="md:hidden flex-shrink-0 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#2b2d31]"
      >
        <div
          ref={mobileNavRef}
          className="flex items-center gap-0.5 px-2 pt-6 pb-1.5 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          role="tablist"
          aria-label="Template pages"
        >
          {pages.map((page) => (
            <button
              key={page.id}
              data-active={page.id === selectedPageId ? "true" : undefined}
              onClick={() => onSelectPage(page.id)}
              role="tab"
              aria-selected={page.id === selectedPageId}
              className={cn(
                "flex-shrink-0 px-2.5 py-1.5 text-[10px] sm:text-[11px] font-medium transition-all whitespace-nowrap border-b-2",
                page.id === selectedPageId
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-200"
              )}
            >
              {page.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        isAnimating ? "opacity-50" : "opacity-100"
      )}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-6 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[10px] sm:text-[11px] md:text-xs text-gray-400 dark:text-gray-500 mb-1.5 sm:mb-2 md:mb-4">
            <span className="truncate max-w-[80px] sm:max-w-none">{template.name}</span>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300 truncate">{selectedPage?.title}</span>
          </div>

          {/* Page Heading */}
          <h1 className="text-base sm:text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 md:mb-3">
            {selectedPage?.content.heading}
          </h1>

          {/* Description */}
          {selectedPage?.content.description && (
            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mb-2 sm:mb-4 md:mb-8">
              {selectedPage.content.description}
            </p>
          )}

          {/* Callout Box */}
          {selectedPage?.content.callout && (
            <div className="bg-teal-600 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-5 md:mb-8">
              <h3 className="font-semibold text-white mb-1.5 sm:mb-2.5 md:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                {selectedPage.content.callout.title}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                {selectedPage.content.callout.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 sm:gap-2.5 md:gap-3 text-white/90 text-[11px] sm:text-xs md:text-sm"
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
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {selectedPage.content.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 md:mb-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                    {section.title}
                  </h3>
                  {section.content && (
                    <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 pl-3 sm:pl-3.5 md:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
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
