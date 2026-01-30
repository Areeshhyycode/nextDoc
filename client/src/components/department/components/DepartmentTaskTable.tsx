import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ResizableTableHead, useColumnWidths } from "@/components/ui/resizable-table";
import { ArrowUpDown } from "lucide-react";
import { type Project } from "@shared/schema";
import { type SortField } from "../hooks/useProjectFilters";
import { TaskTableRow } from "./TaskTableRow";

interface DepartmentTaskTableProps {
  projects: Project[];
  storageKey: string;
  hasActiveFilters: boolean;
  onSort: (field: SortField) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function DepartmentTaskTable({
  projects,
  storageKey,
  hasActiveFilters,
  onSort,
  onEdit,
  onDelete,
}: DepartmentTaskTableProps) {
  const { widths: columnWidths, updateWidth } = useColumnWidths(storageKey, {
    task: 350,
    status: 110,
    owner: 120,
    stage: 100,
    dueDate: 110,
    risk: 80,
    description: 200,
    actions: 90
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto min-w-0">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <TableRow>
              <ResizableTableHead
                columnKey="task"
                storageKey={storageKey}
                defaultWidth={columnWidths.task}
                minWidth={150}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('task')}
                data-testid="sort-task"
              >
                <div className="flex items-center gap-2">
                  Task
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="status"
                storageKey={storageKey}
                defaultWidth={columnWidths.status}
                minWidth={80}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('status')}
                data-testid="sort-status"
              >
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="owner"
                storageKey={storageKey}
                defaultWidth={columnWidths.owner}
                minWidth={80}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden lg:table-cell"
                onClick={() => onSort('owner')}
                data-testid="sort-owner"
              >
                <div className="flex items-center gap-2">
                  Owner
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="stage"
                storageKey={storageKey}
                defaultWidth={columnWidths.stage}
                minWidth={80}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden xl:table-cell"
                onClick={() => onSort('stage')}
                data-testid="sort-stage"
              >
                <div className="flex items-center gap-2">
                  Stage
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="dueDate"
                storageKey={storageKey}
                defaultWidth={columnWidths.dueDate}
                minWidth={90}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden xl:table-cell"
                onClick={() => onSort('dueDate')}
                data-testid="sort-due-date"
              >
                <div className="flex items-center gap-2">
                  Due Date
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="risk"
                storageKey={storageKey}
                defaultWidth={columnWidths.risk}
                minWidth={70}
                onWidthChange={updateWidth}
                className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden lg:table-cell"
                onClick={() => onSort('risk')}
                data-testid="sort-risk"
              >
                <div className="flex items-center gap-2">
                  Risk
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="description"
                storageKey={storageKey}
                defaultWidth={columnWidths.description}
                minWidth={100}
                onWidthChange={updateWidth}
                className="hidden md:table-cell"
              >
                Description
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="actions"
                storageKey={storageKey}
                defaultWidth={columnWidths.actions}
                minWidth={80}
                onWidthChange={updateWidth}
              >
                Actions
              </ResizableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {hasActiveFilters
                    ? "No tasks match your current filters."
                    : "No tasks yet. Click 'Add New Task' to get started."
                  }
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project, index) => (
                <TaskTableRow
                  key={project.id}
                  project={project}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
