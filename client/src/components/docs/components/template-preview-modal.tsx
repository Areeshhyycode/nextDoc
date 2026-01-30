/**
 * Template Preview Modal - Clean & Minimal
 *
 * Features:
 * - Left sidebar with nested pages
 * - Right content area showing SELECTED page content
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Search/filter templates
 * - Mobile responsive
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ChevronDown,
  Search,
  ChevronLeft,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Template page structure
export interface TemplatePage {
  id: string;
  title: string;
  content: TemplatePageContent;
  children?: TemplatePage[];
}

export interface TemplatePageContent {
  heading: string;
  description?: string;
  callout?: {
    title: string;
    items: string[];
  };
  sections?: {
    title: string;
    content?: string;
  }[];
}

export interface TemplateData {
  id: string;
  name: string;
  pages: TemplatePage[];
}

// Project Overview Template Data - with 5 sub-templates
export const projectOverviewTemplate: TemplateData = {
  id: "project_overview",
  name: "Project Overview",
  pages: [
    {
      id: "project-brief",
      title: "Project Brief",
      content: {
        heading: "Project Brief",
        description: "A concise overview of your project's purpose and goals",
        callout: {
          title: "Project Brief Guidelines",
          items: [
            "Define the project purpose and business value",
            "Outline key objectives and success metrics",
            "Identify target audience and stakeholders",
          ],
        },
        sections: [
          { title: "Project Name", content: "Enter your project name..." },
          { title: "Project Summary", content: "Brief description of what this project aims to achieve..." },
          { title: "Business Objectives", content: "Key business goals this project supports..." },
        ],
      },
    },
    {
      id: "project-plan",
      title: "Project Plan",
      content: {
        heading: "Project Plan",
        description: "Detailed roadmap with phases, milestones, and deliverables",
        sections: [
          { title: "Phase 1: Discovery", content: "Research and requirements gathering..." },
          { title: "Phase 2: Design", content: "Solution design and architecture..." },
          { title: "Phase 3: Development", content: "Implementation and building..." },
          { title: "Phase 4: Testing", content: "QA and validation..." },
          { title: "Phase 5: Launch", content: "Deployment and go-live..." },
        ],
      },
    },
    {
      id: "requirements-doc",
      title: "Requirements Document",
      content: {
        heading: "Requirements Document",
        description: "Comprehensive list of functional and non-functional requirements",
        sections: [
          { title: "Functional Requirements", content: "What the system should do..." },
          { title: "Non-Functional Requirements", content: "Performance, security, scalability..." },
          { title: "User Stories", content: "As a user, I want to..." },
          { title: "Acceptance Criteria", content: "Conditions that must be met..." },
        ],
      },
    },
    {
      id: "stakeholder-map",
      title: "Stakeholder Map",
      content: {
        heading: "Stakeholder Map",
        description: "Identify and organize all project stakeholders",
        sections: [
          { title: "Project Sponsor", content: "Executive sponsor and decision maker..." },
          { title: "Core Team", content: "Team members and their roles..." },
          { title: "Subject Matter Experts", content: "Domain experts consulted..." },
          { title: "External Partners", content: "Vendors, contractors, agencies..." },
        ],
      },
    },
    {
      id: "risk-register",
      title: "Risk Register",
      content: {
        heading: "Risk Register",
        description: "Track and manage project risks and mitigation strategies",
        callout: {
          title: "Risk Management Tips",
          items: [
            "Identify risks early and review regularly",
            "Assign owners to each risk",
            "Create mitigation plans for high-priority risks",
          ],
        },
        sections: [
          { title: "High Priority Risks", content: "Critical risks requiring immediate attention..." },
          { title: "Medium Priority Risks", content: "Risks to monitor closely..." },
          { title: "Low Priority Risks", content: "Risks to track periodically..." },
        ],
      },
    },
  ],
};

// Meeting Notes Template Data - with 5 sub-templates
export const meetingNotesTemplate: TemplateData = {
  id: "meeting_notes",
  name: "Meeting Notes",
  pages: [
    {
      id: "meeting-guidelines",
      title: "Meeting Guidelines",
      content: {
        heading: "Meeting Guidelines",
        description: "Best practices for effective meetings",
        callout: {
          title: "Meeting Expectations",
          items: [
            "Before the meeting, attendees add items and updates to the agenda.",
            "During the meeting, an assigned notetaker or all attendees capture notes in the Doc.",
            "After the meeting, the meeting facilitator assigns out action items by creating tasks.",
          ],
        },
      },
    },
    {
      id: "weekly-team-meeting",
      title: "Weekly Team Meeting",
      content: {
        heading: "Weekly Team Meeting",
        description: "Template for recurring team sync meetings",
        sections: [
          { title: "Date & Attendees", content: "Meeting date and participant list..." },
          { title: "Agenda", content: "Topics to discuss this week..." },
          { title: "Updates from Last Week", content: "Progress on previous action items..." },
          { title: "Discussion Notes", content: "Key points and decisions made..." },
          { title: "Action Items", content: "Tasks assigned with owners and deadlines..." },
        ],
      },
    },
    {
      id: "daily-standup",
      title: "Daily Standup/Sync",
      content: {
        heading: "Daily Standup/Sync",
        description: "Quick daily sync template for agile teams",
        callout: {
          title: "Standup Format",
          items: [
            "Keep it brief - 15 minutes max",
            "Each person shares updates",
            "Flag blockers immediately",
          ],
        },
        sections: [
          { title: "Yesterday", content: "What I accomplished yesterday..." },
          { title: "Today", content: "What I'm working on today..." },
          { title: "Blockers", content: "Any obstacles or blockers..." },
        ],
      },
    },
    {
      id: "one-on-one",
      title: "1:1 Meeting",
      content: {
        heading: "1:1 Meeting",
        description: "Template for manager-employee one-on-one meetings",
        sections: [
          { title: "Check-in", content: "How are you doing? Any personal updates?" },
          { title: "Wins & Achievements", content: "Recent accomplishments to celebrate..." },
          { title: "Challenges", content: "Current obstacles or concerns..." },
          { title: "Goals Progress", content: "Updates on OKRs or personal goals..." },
          { title: "Feedback", content: "Feedback for each other..." },
          { title: "Action Items", content: "Follow-up tasks..." },
        ],
      },
    },
    {
      id: "retrospective",
      title: "Retrospective",
      content: {
        heading: "Retrospective",
        description: "Sprint or project retrospective template",
        callout: {
          title: "Retro Guidelines",
          items: [
            "Focus on improvement, not blame",
            "Everyone's voice matters",
            "Commit to actionable changes",
          ],
        },
        sections: [
          { title: "What Went Well", content: "Successes and wins to celebrate..." },
          { title: "What Could Be Improved", content: "Areas for improvement..." },
          { title: "Action Items", content: "Specific changes to implement..." },
        ],
      },
    },
  ],
};

// Helper function to generate HTML content from template page
export function generateTemplateContent(page: TemplatePage): { title: string; content: string } {
  let html = "";

  // Add heading
  html += `<h1>${page.content.heading}</h1>`;

  // Add description if exists
  if (page.content.description) {
    html += `<p><em>${page.content.description}</em></p>`;
  }

  // Add callout if exists
  if (page.content.callout) {
    html += `<blockquote><p><strong>${page.content.callout.title}</strong></p><ul>`;
    page.content.callout.items.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</ul></blockquote>`;
  }

  // Add sections if exist
  if (page.content.sections) {
    page.content.sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      if (section.content) {
        html += `<p>${section.content}</p>`;
      } else {
        html += `<p></p>`;
      }
    });
  }

  return {
    title: page.content.heading,
    content: html,
  };
}

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: "project_overview" | "meeting_notes";
  onUseTemplate: (selectedPage: TemplatePage) => void;
  /** Optional: Show add page functionality when documentId is provided */
  documentId?: string | null;
  /** Optional: Callback when a new page is added */
  onAddPage?: (title: string) => Promise<void>;
  /** Optional: Whether add page is currently submitting */
  isAddingPage?: boolean;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  templateType,
  onUseTemplate,
  documentId,
  onAddPage,
  isAddingPage = false,
}: TemplatePreviewModalProps) {
  const template = templateType === "project_overview"
    ? projectOverviewTemplate
    : meetingNotesTemplate;

  const [selectedPageId, setSelectedPageId] = useState(template.pages[0]?.id || "");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Flatten pages for keyboard navigation
  const flattenPages = useCallback((pages: TemplatePage[]): TemplatePage[] => {
    return pages.reduce((acc: TemplatePage[], page) => {
      acc.push(page);
      if (page.children && expandedIds.has(page.id)) {
        acc.push(...flattenPages(page.children));
      }
      return acc;
    }, []);
  }, [expandedIds]);

  // Filter pages based on search
  const filterPages = useCallback((pages: TemplatePage[], query: string): TemplatePage[] => {
    if (!query.trim()) return pages;
    const lowerQuery = query.toLowerCase();
    return pages.filter(page =>
      page.title.toLowerCase().includes(lowerQuery) ||
      page.content.heading.toLowerCase().includes(lowerQuery) ||
      page.content.description?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const filteredPages = filterPages(template.pages, searchQuery);
  const flatPages = flattenPages(filteredPages);

  // Reset state when template changes
  useEffect(() => {
    setSelectedPageId(template.pages[0]?.id || "");
    setExpandedIds(new Set());
    setSearchQuery("");
    setShowSearch(false);
  }, [templateType, template.pages]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Find selected page recursively
  const findPage = (pages: TemplatePage[], id: string): TemplatePage | null => {
    for (const page of pages) {
      if (page.id === id) return page;
      if (page.children) {
        const found = findPage(page.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedPage = findPage(template.pages, selectedPageId);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    const currentIndex = flatPages.findIndex(p => p.id === selectedPageId);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (currentIndex < flatPages.length - 1) {
          setIsAnimating(true);
          setSelectedPageId(flatPages[currentIndex + 1].id);
          setTimeout(() => setIsAnimating(false), 150);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (currentIndex > 0) {
          setIsAnimating(true);
          setSelectedPageId(flatPages[currentIndex - 1].id);
          setTimeout(() => setIsAnimating(false), 150);
        }
        break;
      case "Enter":
        if (!showSearch && selectedPage) {
          e.preventDefault();
          handleUseTemplate();
        }
        break;
      case "Escape":
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
        } else {
          onClose();
        }
        break;
      case "/":
        if (!showSearch) {
          e.preventDefault();
          setShowSearch(true);
        }
        break;
    }
  }, [isOpen, flatPages, selectedPageId, selectedPage, showSearch, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleUseTemplate = () => {
    if (selectedPage) {
      onUseTemplate(selectedPage);
    }
    onClose();
  };

  // Render sidebar page item
  const renderPageItem = (page: TemplatePage, depth: number = 0) => {
    const hasChildren = page.children && page.children.length > 0;
    const isExpanded = expandedIds.has(page.id);
    const isSelected = selectedPageId === page.id;

    return (
      <div key={page.id}>
        <button
          onClick={() => {
            setIsAnimating(true);
            setSelectedPageId(page.id);
            setTimeout(() => setIsAnimating(false), 150);
            if (hasChildren) toggleExpanded(page.id);
          }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-[13px] transition-colors relative",
            "hover:bg-white/10",
            isSelected && "bg-white/10 text-white"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          aria-selected={isSelected}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {isSelected && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r" />
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
                toggleExpanded(page.id);
              }}
            >
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </span>
          )}
          {!hasChildren && (
            <span className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              isSelected ? "bg-indigo-400" : "bg-gray-600"
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[98vw] sm:w-[95vw] max-w-[900px] h-[90vh] sm:h-[85vh] max-h-[600px] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>{template.name} Template Preview</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div
            ref={sidebarRef}
            className={cn(
              "flex-shrink-0 bg-[#2b2d31] dark:bg-[#1e2024] flex flex-col border-r border-white/10",
              "hidden md:flex",
              sidebarCollapsed ? "w-0 overflow-hidden" : "w-[240px]"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-2 sm:p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
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
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg transition-colors",
                    showSearch ? "bg-white/10 text-white" : "hover:bg-white/10 text-gray-400"
                  )}
                  aria-label="Search templates"
                >
                  <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-9 h-8 bg-white/5 border-white/10 text-white text-sm placeholder:text-gray-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
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

          {/* Right Content Area */}
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
                onClick={() => setSidebarCollapsed(false)}
                className="absolute top-3 left-3 z-20 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden md:flex"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Content - Shows selected page content */}
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

            {/* Footer with Use Template button */}
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
                  {/* Add as Page button - only show when documentId exists (existing doc) */}
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
                    onClick={handleUseTemplate}
                    className="flex-1 sm:flex-none h-8 sm:h-9 px-3 sm:px-6 text-[11px] sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Use Template
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
