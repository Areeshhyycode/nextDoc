import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { type Project } from "@shared/schema";
import { STATUS_COLORS, RISK_COLORS, STAGE_COLORS } from "@/constants/colors";

interface TaskTableRowProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function TaskTableRow({ project, index, onEdit, onDelete }: TaskTableRowProps) {
  return (
    <TableRow
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
      }`}
      data-testid={`task-row-${project.id}`}
    >
      <TableCell className="font-medium">
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2" title={project.task}>
            {project.task}
          </div>
          {/* Mobile-only details */}
          <div className="flex flex-wrap gap-2 lg:hidden">
            {project.owner && (
              <Badge variant="outline" className="text-xs">
                {project.owner}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={`text-xs ${RISK_COLORS[(project.risk || 'none') as keyof typeof RISK_COLORS] || ''}`}
            >
              {project.risk || 'No Risk'}
            </Badge>
            {project.dueDate && (
              <Badge variant="outline" className="text-xs">
                {format(new Date(project.dueDate), 'MMM dd')}
              </Badge>
            )}
          </div>
          {/* Additional mobile info */}
          <div className="xl:hidden">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge
                variant="secondary"
                className={`text-xs ${STAGE_COLORS[project.stage as keyof typeof STAGE_COLORS] || ''}`}
              >
                {project.stage}
              </Badge>
              {project.dependencies && project.dependencies.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {project.dependencies.length} deps
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={`text-xs ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || ''}`}
        >
          {project.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {project.owner || '\u2014'}
        </span>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <Badge
          variant="secondary"
          className={`text-xs ${STAGE_COLORS[project.stage as keyof typeof STAGE_COLORS] || ''}`}
        >
          {project.stage}
        </Badge>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {project.dueDate ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(project.dueDate), 'MMM dd, yyyy')}
          </span>
        ) : '\u2014'}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Badge
          variant="secondary"
          className={`text-xs ${RISK_COLORS[(project.risk || 'none') as keyof typeof RISK_COLORS] || ''}`}
        >
          {project.risk || 'None'}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="max-w-[180px] text-sm text-gray-600 dark:text-gray-400">
          {(project as any).description ? (
            <div
              className="break-words line-clamp-3 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: (project as any).description }}
              title={(project as any).description?.replace(/<[^>]*>/g, '') || ''}
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
            className="h-8 w-8 p-0"
            title="Edit task"
            data-testid={`edit-task-${project.id}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
            title="Delete task"
            data-testid={`delete-task-${project.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
