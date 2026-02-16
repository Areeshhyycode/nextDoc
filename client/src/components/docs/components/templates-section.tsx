import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { TemplateCard } from "./template-card";
import { ProjectOverviewIcon, MeetingNotesIcon } from "./document-icons";
import {
  TemplatePreviewModal,
  generateTemplateContent,
  type TemplatePage
} from "./template-preview-modal";

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

  const handleUseTemplate = useCallback((selectedPage: TemplatePage) => {
    const { title, content } = generateTemplateContent(selectedPage);
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
      <section className="mb-6" aria-labelledby="templates-heading">
        <h2
          id="templates-heading"
          className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 font-semibold uppercase tracking-widest"
        >
          Quick Templates
        </h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl"
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
