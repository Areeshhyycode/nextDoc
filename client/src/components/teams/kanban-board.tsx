import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './kanban-column';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import type { Project, TeamMember, KanbanColumn as KanbanColumnType } from '@shared/schema';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  projects: Project[];
  teamMembers: TeamMember[];
  onCardMove: (projectId: string, columnName: string) => void;
  onAddColumn?: () => void;
  showAddColumn?: boolean;
  onEditStatuses?: () => void;
  onCreateTask: (taskData: {
    task: string;
    dueDate: string | null;
    owner: string | null;
    effortEstimate: number | null;
    taskType: string | null;
    status: string;
  }) => void;
}

export function KanbanBoard({
  columns,
  projects,
  teamMembers,
  onCardMove,
  onAddColumn,
  showAddColumn = false,
  onEditStatuses,
  onCreateTask,
}: KanbanBoardProps) {
  // Group projects by column name
  const projectsByColumn = columns.reduce((acc, column) => {
    acc[column.name] = projects.filter((project) => {
      // Match based on status or a custom kanban column field
      // For now, we'll use status mapping
      return project.status === column.name || 
             (column.name === 'New task' && project.status === 'Not Started') ||
             (column.name === 'Scheduled' && project.scheduledDate !== null);
    });
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col" data-testid="kanban-board">
        {/* Board Header with Gear Icon */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs">
                <span className="text-sm">{column.icon || '📋'}</span>
                <span className="font-medium">{column.name}</span>
                <span className="text-gray-500">{projectsByColumn[column.name]?.length || 0}</span>
              </div>
            ))}
          </div>
          {onEditStatuses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditStatuses}
              className="h-8 w-8 p-0"
              data-testid="button-edit-statuses"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </div>

        {/* Kanban Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-4 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                projects={projectsByColumn[column.name] || []}
                teamMembers={teamMembers}
                onCardDrop={onCardMove}
                onCreateTask={onCreateTask}
              />
            ))}
            
            {/* Add Column Button */}
            {showAddColumn && (
              <div className="min-w-[280px] max-w-[320px]">
                <Button
                  variant="outline"
                  className="w-full h-16 border-dashed"
                  onClick={onAddColumn}
                  data-testid="button-add-column"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
