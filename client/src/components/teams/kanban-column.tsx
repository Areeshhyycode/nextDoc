import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanCard } from './kanban-card';
import { InlineTaskCreator } from './inline-task-creator';
import type { Project, TeamMember, KanbanColumn as KanbanColumnType } from '@shared/schema';

interface KanbanColumnProps {
  column: KanbanColumnType;
  projects: Project[];
  teamMembers: TeamMember[];
  onCardDrop: (projectId: string, columnName: string) => void;
  onCreateTask: (taskData: {
    task: string;
    dueDate: string | null;
    owner: string | null;
    effortEstimate: number | null;
    taskType: string | null;
    status: string;
  }) => void;
}

export function KanbanColumn({ column, projects, teamMembers, onCardDrop, onCreateTask }: KanbanColumnProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [{ isOver }, drop] = useDrop({
    accept: 'KANBAN_CARD',
    drop: (item: { projectId: string }) => {
      onCardDrop(item.projectId, column.name);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex flex-col min-w-[280px] max-w-[320px] h-full ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      } transition-colors rounded-lg`}
      data-testid={`kanban-column-${column.id}`}
    >
      <Card className="h-full flex flex-col shadow-sm">
        {/* Column Header */}
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" role="img" aria-label={column.name}>
                {column.icon || '📋'}
              </span>
              <h3 className="font-semibold text-sm" data-testid={`column-name-${column.id}`}>
                {column.name}
              </h3>
            </div>
            <Badge variant="secondary" className="ml-2" data-testid={`column-count-${column.id}`}>
              {projects.length}
            </Badge>
          </div>
        </CardHeader>

        {/* Cards Container */}
        <CardContent className="flex-1 p-3 space-y-2 overflow-y-auto">
          {projects.map((project) => {
            const owner = teamMembers.find((m) => m.id === project.owner);
            return (
              <KanbanCard
                key={project.id}
                project={project}
                owner={owner}
              />
            );
          })}

          {projects.length === 0 && !showCreator && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg" data-testid={`column-empty-${column.id}`}>
              Drop cards here
            </div>
          )}

          {/* Inline Task Creator */}
          {showCreator ? (
            <InlineTaskCreator
              columnName={column.name}
              teamMembers={teamMembers}
              onSave={(taskData) => {
                onCreateTask({
                  ...taskData,
                  status: column.name,
                });
                setShowCreator(false);
              }}
              onCancel={() => setShowCreator(false)}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => setShowCreator(true)}
              data-testid={`button-create-task-${column.id}`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create task
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
