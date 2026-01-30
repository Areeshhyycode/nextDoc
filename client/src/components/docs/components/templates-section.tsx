/**
 * Templates Section
 *
 * Quick-start templates with ClickUp-style preview modal.
 * Shows ONLY Project Overview and Meeting Notes templates.
 *
 * Features:
 * - Data-driven template cards
 * - Accessible keyboard navigation
 * - ClickUp-style preview modal with nested pages
 * - Creates documents with specific sub-template content
 * - Responsive design
 */

import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { TemplateCard } from "./template-card";
import { ProjectOverviewIcon, MeetingNotesIcon } from "./document-icons";
import {
  TemplatePreviewModal,
  generateTemplateContent,
  type TemplatePage
} from "./template-preview-modal";

// Template definitions - data-driven approach
const TEMPLATES = [
  {
    id: "project_overview" as const,
    title: "Project Overview",
    description: "Summarize goals, scope, and milestones",
    icon: <ProjectOverviewIcon />,
  },
  {
    id: "meeting_notes" as const,
    title: "Meeting Notes",
    description: "Capture an agenda, notes, and action items",
    icon: <MeetingNotesIcon />,
  },
] as const;

type TemplateId = typeof TEMPLATES[number]["id"];

interface TemplatesSectionProps {
  onCreateProjectOverview: () => void;
  onCreateMeetingNotes: () => void;
}

export function TemplatesSection({
  onCreateProjectOverview,
  onCreateMeetingNotes
}: TemplatesSectionProps) {
  const [, navigate] = useLocation();
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);

  const handleTemplateClick = useCallback((templateId: TemplateId) => {
    setPreviewTemplate(templateId);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTemplate(null);
  }, []);

  // Handle using a specific sub-template
  const handleUseTemplate = useCallback((selectedPage: TemplatePage) => {
    // Generate the HTML content from the selected template
    const { title, content } = generateTemplateContent(selectedPage);

    // Encode the template data and navigate to new doc with it
    const templateData = encodeURIComponent(JSON.stringify({
      title,
      content,
      templateId: selectedPage.id
    }));

    navigate(`/docs/new?template=${templateData}`);
    setPreviewTemplate(null);
  }, [navigate]);

  return (
    <>
      <section
        className="mb-3 sm:mb-4 lg:mb-6"
        aria-labelledby="templates-heading"
      >
        <h2
          id="templates-heading"
          className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 font-bold uppercase tracking-wide"
        >
          Quick Templates
        </h2>

        <div
          className="grid grid-cols-2 gap-1.5 sm:gap-3 max-w-2xl"
          role="list"
          aria-label="Available document templates"
        >
          {TEMPLATES.map((template) => (
            <div key={template.id} role="listitem">
              <TemplateCard
                icon={template.icon}
                title={template.title}
                description={template.description}
                onClick={() => handleTemplateClick(template.id)}
                ariaLabel={`Preview ${template.title} template`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ClickUp-style Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={true}
          onClose={handleClosePreview}
          templateType={previewTemplate}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </>
  );
}
