import { useDrag } from 'react-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { Project, TeamMember } from '@shared/schema';

interface KanbanCardProps {
  project: Project;
  owner?: TeamMember;
}

const getRiskColor = (risk: string | null) => {
  switch (risk) {
    case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'Reviewing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export function KanbanCard({ project, owner }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'KANBAN_CARD',
    item: { projectId: project.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card
      ref={drag}
      className={`cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      data-testid={`kanban-card-${project.id}`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Task Name */}
        <h4 className="font-medium text-sm line-clamp-2" data-testid={`card-title-${project.id}`}>
          {project.task}
        </h4>

        {/* Status and Risk */}
        <div className="flex flex-wrap gap-1.5">
          {project.status && (
            <Badge variant="secondary" className={`text-xs ${getStatusColor(project.status)}`} data-testid={`badge-status-${project.id}`}>
              {project.status}
            </Badge>
          )}
          {project.risk && (
            <Badge variant="secondary" className={`text-xs ${getRiskColor(project.risk)}`} data-testid={`badge-risk-${project.id}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {project.risk}
            </Badge>
          )}
        </div>

        {/* Due Date and Effort */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {project.dueDate && (
            <div className="flex items-center gap-1" data-testid={`date-due-${project.id}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {project.effortEstimate && (
            <div className="flex items-center gap-1" data-testid={`effort-${project.id}`}>
              <Clock className="w-3 h-3" />
              <span>{project.effortEstimate}h</span>
            </div>
          )}
        </div>

        {/* Owner Avatar */}
        {owner && (
          <div className="flex items-center gap-2 pt-1 border-t">
            <Avatar className="h-5 w-5">
              <AvatarFallback 
                className="text-xs text-white" 
                style={{ backgroundColor: owner.avatarColor || '#3B82F6' }}
              >
                {owner.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate" data-testid={`owner-name-${project.id}`}>
              {owner.name}
            </span>
          </div>
        )}

        {/* Completion Percentage */}
        {project.completionPercentage !== null && project.completionPercentage > 0 && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" data-testid={`progress-${project.id}`}>{project.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${project.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
