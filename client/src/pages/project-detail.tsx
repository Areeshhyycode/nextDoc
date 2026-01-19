import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, LayoutList, Kanban as KanbanIcon, GanttChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkspaceProject } from "@shared/schema";
import { cn } from "@/lib/utils";
import { OverviewTab } from "@/components/projects/overview-tab";
import { ProjectKanbanTab } from "@/components/projects/project-kanban-tab";
import { ProjectListTab } from "@/components/projects/project-list-tab";
import { ProjectGanttTab } from "@/components/projects/project-gantt-tab";
import { format } from "date-fns";

interface Tab {
  id: string;
  label: string;
  icon: any;
  isDueDate?: boolean;
}

const DEFAULT_TABS: Tab[] = [
  { id: "due-date", label: "Due date", icon: Calendar, isDueDate: true },
  { id: "overview", label: "Overview", icon: FileText },
  { id: "gantt", label: "Gantt", icon: GanttChart },
  { id: "list", label: "List", icon: LayoutList },
  { id: "kanban", label: "Kanban", icon: KanbanIcon },
];

function SortableTab({ tab, isActive, onClick, dueDate }: { tab: Tab; isActive: boolean; onClick: () => void; dueDate?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = tab.icon;
  const displayLabel = tab.isDueDate && dueDate ? `Due: ${format(new Date(dueDate), "MMM d, yyyy")}` : tab.label;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="inline-block"
    >
      <button
        onClick={() => onClick()}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer",
          isActive
            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          tab.isDueDate && dueDate && "text-blue-600 dark:text-blue-400"
        )}
        data-testid={`tab-${tab.id}`}
      >
        <span {...listeners} className="cursor-grab active:cursor-grabbing">
          <Icon className="h-4 w-4" />
        </span>
        {displayLabel}
      </button>
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [tabs, setTabs] = useState(DEFAULT_TABS);

  const { data: project, isLoading } = useQuery<WorkspaceProject>({
    queryKey: ["/api/workspace-projects", projectId],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: project.color }}
            >
              {project.name[0]?.toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          </div>

          {/* Draggable Tabs */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabs.map(t => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-center gap-2 mt-4">
                {tabs.map((tab) => (
                  <SortableTab
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    dueDate={project.endDate || undefined}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn("p-6", activeTab === "gantt" && "p-0")}>
        {activeTab === "overview" && (
          <OverviewTab project={project} projectId={projectId!} />
        )}
        {activeTab === "due-date" && <div>Due date content</div>}
        {activeTab === "gantt" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border h-[calc(100vh-240px)]">
            <ProjectGanttTab projectId={projectId!} />
          </div>
        )}
        {activeTab === "list" && <ProjectListTab projectId={projectId!} />}
        {activeTab === "kanban" && <ProjectKanbanTab projectId={projectId!} />}
      </div>
    </div>
  );
}
