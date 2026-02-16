import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  Search,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplatePage, TemplateData } from "./types";

interface TemplateSidebarProps {
  template: TemplateData;
  filteredPages: TemplatePage[];
  selectedPageId: string;
  expandedIds: Set<string>;
  searchQuery: string;
  showSearch: boolean;
  sidebarCollapsed: boolean;
  onSelectPage: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onSearchChange: (value: string) => void;
  onToggleSearch: () => void;
  onCollapse: () => void;
}

export function TemplateSidebar({
  template,
  filteredPages,
  selectedPageId,
  expandedIds,
  searchQuery,
  showSearch,
  sidebarCollapsed,
  onSelectPage,
  onToggleExpanded,
  onSearchChange,
  onToggleSearch,
  onCollapse,
}: TemplateSidebarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const renderPageItem = (page: TemplatePage, depth: number = 0) => {
    const hasChildren = page.children && page.children.length > 0;
    const isExpanded = expandedIds.has(page.id);
    const isSelected = selectedPageId === page.id;

    return (
      <div key={page.id}>
        <button
          onClick={() => {
            onSelectPage(page.id);
            if (hasChildren) onToggleExpanded(page.id);
          }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-1.5 lg:py-2 rounded-md text-left text-[12px] lg:text-[13px] transition-colors relative",
            "hover:bg-white/10",
            isSelected && "bg-white/10 text-white"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          aria-selected={isSelected}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {isSelected && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-500 rounded-r" />
          )}
          {hasChildren && (
            <span
              className={cn(
                "w-4 h-4 flex items-center justify-center transition-transform",
                isExpanded && "rotate-0",
                !isExpanded && "-rotate-90"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded(page.id);
              }}
            >
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </span>
          )}
          {!hasChildren && (
            <span className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              isSelected ? "bg-teal-400" : "bg-gray-600"
            )} />
          )}
          <span className={cn(
            "truncate",
            isSelected ? "text-white font-medium" : "text-gray-400"
          )}>
            {page.title}
          </span>
        </button>

        {hasChildren && isExpanded && (
          <div role="group">
            {page.children!.map((child) => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 bg-[#2b2d31] dark:bg-[#1e2024] flex flex-col border-r border-white/10",
        "hidden md:flex",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-[200px] lg:w-[240px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-2 sm:p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-xs sm:text-sm">
              {template.name}
            </h3>
            <p className="text-[9px] sm:text-[11px] text-gray-500">
              {template.pages.length} templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={onToggleSearch}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-colors",
              showSearch ? "bg-white/10 text-white" : "hover:bg-white/10 text-gray-400"
            )}
            aria-label="Search templates"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={onCollapse}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hidden md:flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-8 bg-white/5 border-white/10 text-white text-sm placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pages List */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="tree"
        aria-label="Template pages"
      >
        {filteredPages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No templates found
          </div>
        ) : (
          filteredPages.map((page) => renderPageItem(page, 0))
        )}
      </nav>
    </div>
  );
}
