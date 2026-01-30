import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { type Project } from "@shared/schema";
import { STATUS_COLORS, RISK_COLORS, STAGE_COLORS } from "@/constants/colors";
import { formatDisplayValue } from "@/lib/utils";

interface SimpleTableRowProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function SimpleTableRow({ project, index, onEdit, onDelete }: SimpleTableRowProps) {
  return (
    <TableRow
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
      }`}
      data-testid={`task-row-${project.id}`}
    >
      <TableCell className="font-medium">
        <div className="max-w-[200px] truncate" title={project.task}>
          {project.task}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || ''}
        >
          {formatDisplayValue(project.status)}
        </Badge>
      </TableCell>
      <TableCell>{project.owner || '\u2014'}</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={STAGE_COLORS[project.stage as keyof typeof STAGE_COLORS] || ''}
        >
          {formatDisplayValue(project.stage || '')}
        </Badge>
      </TableCell>
      <TableCell>
        {project.dueDate ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {format(new Date(project.dueDate), 'MMM dd, yyyy')}
          </div>
        ) : '\u2014'}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={RISK_COLORS[(project.risk || 'none') as keyof typeof RISK_COLORS] || ''}
        >
          {formatDisplayValue(project.risk || '')}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px] text-sm text-gray-600 dark:text-gray-400">
          {(project as any).description ? (
            <div
              className="break-words line-clamp-3 leading-relaxed"
              title={(project as any).description}
            >
              {(project as any).description}
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[150px] truncate text-gray-600 dark:text-gray-400" title={project.notes || ''}>
          {project.notes || '\u2014'}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
            data-testid={`edit-task-${project.id}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
            data-testid={`delete-task-${project.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
