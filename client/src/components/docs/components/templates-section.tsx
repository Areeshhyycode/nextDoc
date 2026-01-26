import { TemplateCard } from "./template-card";
import { ProjectOverviewIcon, MeetingNotesIcon } from "./document-icons";

interface TemplatesSectionProps {
  onCreateProjectOverview: () => void;
  onCreateMeetingNotes: () => void;
}

export function TemplatesSection({ onCreateProjectOverview, onCreateMeetingNotes }: TemplatesSectionProps) {
  return (
    <div className="mb-4 sm:mb-4 lg:mb-6">
      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-2 font-bold uppercase tracking-wide">Quick Templates</p>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-2xl">
        <TemplateCard
          icon={<ProjectOverviewIcon />}
          title="Project Overview"
          description="Summarize goals, scope, and milestones"
          onClick={onCreateProjectOverview}
        />
        <TemplateCard
          icon={<MeetingNotesIcon />}
          title="Meeting Notes"
          description="Capture an agenda, notes, and action items"
          onClick={onCreateMeetingNotes}
        />
      </div>
    </div>
  );
}
