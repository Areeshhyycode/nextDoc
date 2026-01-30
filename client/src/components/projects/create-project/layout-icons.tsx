// Custom SVG icons for project layout options

const ListViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="12" width="32" height="4" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="8" y="22" width="32" height="4" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="8" y="32" width="32" height="4" rx="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const KanbanViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="6" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="32" y="8" width="10" height="28" rx="2" fill="currentColor" opacity="0.7"/>
  </svg>
);

const GanttViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="10" width="16" height="4" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="18" width="20" height="4" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="10" y="26" width="24" height="4" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="14" y="34" width="18" height="4" rx="2" fill="currentColor" opacity="0.8"/>
  </svg>
);

export const LAYOUT_OPTIONS = [
  { id: "list", name: "List View", description: "View actions in a list", icon: ListViewIcon },
  { id: "kanban", name: "Kanban View", description: "Track the status of each action", icon: KanbanViewIcon },
  { id: "gantt", name: "Gantt View", description: "View actions in gantt chart", icon: GanttViewIcon },
] as const;
