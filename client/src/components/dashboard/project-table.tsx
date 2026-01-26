import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search } from "lucide-react";
import { type Project } from "@shared/schema";
import { getStatusConfig, getDepartmentColor } from "@/constants/colors";

interface ProjectTableProps {
  projects: Project[];
  onFilter: (filters: { department?: string; status?: string; search?: string }) => void;
}

export function ProjectTable({ projects, onFilter }: ProjectTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFilter({ 
      department: departmentFilter || undefined, 
      status: statusFilter || undefined,
      search: value || undefined 
    });
  };

  const handleDepartmentFilter = (value: string) => {
    const dept = value === "all" ? "" : value;
    setDepartmentFilter(dept);
    onFilter({ 
      department: dept || undefined, 
      status: statusFilter || undefined,
      search: searchQuery || undefined 
    });
  };

  const handleStatusFilter = (value: string) => {
    const status = value === "all" ? "" : value;
    setStatusFilter(status);
    onFilter({ 
      department: departmentFilter || undefined, 
      status: status || undefined,
      search: searchQuery || undefined 
    });
  };

  const getStatusBadge = (status: string) => getStatusConfig(status);

  const getDepartmentBadge = (department: string) => getDepartmentColor(department);

  return (
    <Card className="border border-gray-200 dark:border-gray-700" data-testid="project-table">
      <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Project Overview</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 h-12 sm:h-10 text-[16px] sm:text-sm"
                data-testid="input-search-projects"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            </div>

            <Select value={departmentFilter || "all"} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-40 h-12 sm:h-10 text-[15px] sm:text-sm" data-testid="select-department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[15px] sm:text-sm">All Departments</SelectItem>
                <SelectItem value="Product" className="text-[15px] sm:text-sm">Product</SelectItem>
                <SelectItem value="Design" className="text-[15px] sm:text-sm">Design</SelectItem>
                <SelectItem value="Dev" className="text-[15px] sm:text-sm">Dev</SelectItem>
                <SelectItem value="Marketing & Sales" className="text-[15px] sm:text-sm">Marketing & Sales</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 h-12 sm:h-10 text-[15px] sm:text-sm" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[15px] sm:text-sm">All Status</SelectItem>
                <SelectItem value="Completed" className="text-[15px] sm:text-sm">Completed</SelectItem>
                <SelectItem value="In Progress" className="text-[15px] sm:text-sm">In Progress</SelectItem>
                <SelectItem value="Not Started" className="text-[15px] sm:text-sm">Not Started</SelectItem>
                <SelectItem value="Blocked" className="text-[15px] sm:text-sm">Blocked</SelectItem>
                <SelectItem value="Reviewing" className="text-[15px] sm:text-sm">Reviewing</SelectItem>
                <SelectItem value="Design Approval Needed" className="text-[15px] sm:text-sm">Design Approval Needed</SelectItem>
                <SelectItem value="Temporary Hold" className="text-[15px] sm:text-sm">Temporary Hold</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary-600 hover:bg-primary-700 h-12 sm:h-10 text-[15px] sm:text-sm" data-testid="button-add-project">
              <Plus className="mr-2 h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
              Add Project
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400" data-testid="text-no-projects">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const statusBadge = getStatusBadge(project.status);
                  const deptBadge = getDepartmentBadge(project.department);
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" data-testid={`row-project-${project.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${deptBadge.className} rounded-lg flex items-center justify-center mr-3`}>
                            <span className="text-sm font-medium">
                              {project.department === 'Product' ? '📦' : 
                               project.department === 'Design' ? '🎨' :
                               project.department === 'Dev' ? '💻' : '📢'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-project-title-${project.id}`}>
                              {project.task}
                            </div>
                            {project.notes && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {project.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-xs font-medium"
                            style={{ backgroundColor: "#3B82F6" }}
                          >
                            {project.owner.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white" data-testid={`text-project-owner-${project.id}`}>
                            {project.owner}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={deptBadge.className} data-testid={`badge-project-department-${project.id}`}>
                          {deptBadge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusBadge.variant} className={statusBadge.className} data-testid={`badge-project-status-${project.id}`}>
                          {statusBadge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Progress 
                            value={project.status === 'Completed' ? 100 : project.status === 'In Progress' ? 50 : 0} 
                            className="w-16 mr-2" 
                            data-testid={`progress-project-${project.id}`}
                          />
                          <span className="text-sm text-gray-900 dark:text-white" data-testid={`text-project-progress-${project.id}`}>
                            {project.status === 'Completed' ? 100 : project.status === 'In Progress' ? 50 : 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="text-sm text-gray-900 dark:text-white"
                          data-testid={`text-project-due-date-${project.id}`}
                        >
                          {project.dueDate || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3" data-testid={`button-edit-project-${project.id}`}>
                          Edit
                        </button>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300" data-testid={`button-view-project-${project.id}`}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="text-no-projects">
              No projects found
            </div>
          ) : (
            projects.map((project) => {
              const statusBadge = getStatusBadge(project.status);
              const deptBadge = getDepartmentBadge(project.department);
              const progress = project.status === 'Completed' ? 100 : project.status === 'In Progress' ? 50 : 0;

              return (
                <div
                  key={project.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3"
                  data-testid={`row-project-${project.id}`}
                >
                  {/* Project Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${deptBadge.className} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-base">
                        {project.department === 'Product' ? '📦' :
                         project.department === 'Design' ? '🎨' :
                         project.department === 'Dev' ? '💻' : '📢'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1" data-testid={`text-project-title-${project.id}`}>
                        {project.task}
                      </h4>
                      {project.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {project.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status and Department Badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge.variant} className={statusBadge.className} data-testid={`badge-project-status-${project.id}`}>
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="secondary" className={deptBadge.className} data-testid={`badge-project-department-${project.id}`}>
                      {deptBadge.label}
                    </Badge>
                  </div>

                  {/* Owner and Due Date */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Owner</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: "#3B82F6" }}
                        >
                          {project.owner.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="text-gray-900 dark:text-white truncate" data-testid={`text-project-owner-${project.id}`}>
                          {project.owner}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
                      <div className="text-gray-900 dark:text-white" data-testid={`text-project-due-date-${project.id}`}>
                        {project.dueDate || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-project-progress-${project.id}`}>
                        {progress}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      data-testid={`progress-project-${project.id}`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <button
                      className="flex-1 text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 text-sm font-medium py-2"
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm font-medium py-2"
                      data-testid={`button-view-project-${project.id}`}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
