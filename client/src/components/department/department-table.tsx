import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Calendar, User } from "lucide-react";
import { type Project } from "@shared/schema";

interface DepartmentTableProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onStatusFilter: (status: string) => void;
  statusFilter: string;
  color: string;
}

export function DepartmentTable({ 
  projects, 
  isLoading, 
  onEdit, 
  onDelete, 
  onStatusFilter, 
  statusFilter,
  color 
}: DepartmentTableProps) {
  
  const getStatusBadge = (status: string) => {
    const statusMap = {
      "Completed": { variant: "default" as const, className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" },
      "In Progress": { variant: "secondary" as const, className: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" },
      "Not Started": { variant: "outline" as const, className: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400" },
      "Blocked": { variant: "destructive" as const, className: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" },
      "Reviewing": { variant: "secondary" as const, className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400" },
      "Design Approval Needed": { variant: "secondary" as const, className: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400" },
      "Temporary Hold": { variant: "outline" as const, className: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap["Not Started"];
  };

  const getCompletionPercentage = (project: Project) => {
    if (project.completionPercentage !== null && project.completionPercentage !== undefined) {
      return project.completionPercentage;
    }
    // Fallback based on status
    switch (project.status) {
      case "Completed": return 100;
      case "In Progress": return 50;
      case "Reviewing": return 80;
      case "Design Approval Needed": return 70;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* Filters Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks ({projects.length})
          </h3>
          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Reviewing">Reviewing</SelectItem>
              <SelectItem value="Design Approval Needed">Design Approval Needed</SelectItem>
              <SelectItem value="Temporary Hold">Temporary Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No tasks found</p>
                    <p className="text-sm mt-1">Get started by creating your first task</p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                const completion = getCompletionPercentage(project);
                
                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" data-testid={`row-project-${project.id}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-task-title-${project.id}`}>
                          {project.task}
                        </div>
                        {project.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {project.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusBadge.variant} className={statusBadge.className} data-testid={`badge-status-${project.id}`}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-xs font-medium"
                          style={{ backgroundColor: color }}
                        >
                          {project.owner ? project.owner.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white" data-testid={`text-owner-${project.id}`}>
                          {project.owner || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                        {(project as any).description ? (
                          <div 
                            className="break-words line-clamp-3 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: (project as any).description }}
                            title={(project as any).description?.replace(/<[^>]*>/g, '') || ''}
                            data-testid={`description-${project.id}`}
                          />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic" data-testid={`no-description-${project.id}`}>
                            No description
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span data-testid={`text-due-date-${project.id}`}>
                          {project.dueDate || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(project)}
                          data-testid={`button-edit-${project.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(project.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-${project.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}