import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search } from "lucide-react";
import { type Project } from "@shared/schema";
// Removed format import since we're using text dates directly

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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "Completed": { label: "Completed", variant: "default" as const, className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" },
      "In Progress": { label: "In Progress", variant: "default" as const, className: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" },
      "Not Started": { label: "Not Started", variant: "default" as const, className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400" },
      "Blocked": { label: "Blocked", variant: "default" as const, className: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" },
      "Reviewing": { label: "Reviewing", variant: "default" as const, className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400" },
      "Design Approval Needed": { label: "Design Approval Needed", variant: "default" as const, className: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400" },
      "Temporary Hold": { label: "Temporary Hold", variant: "default" as const, className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap["Not Started"];
  };

  const getDepartmentBadge = (department: string) => {
    const deptMap = {
      "Product": { label: "Product", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" },
      "Design": { label: "Design", className: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400" },
      "Dev": { label: "Dev", className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" },
      "Marketing & Sales": { label: "Marketing & Sales", className: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400" },
    };
    return deptMap[department as keyof typeof deptMap] || deptMap["Product"];
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700" data-testid="project-table">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 pl-10"
                data-testid="input-search-projects"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <Select value={departmentFilter || "all"} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-40" data-testid="select-department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Dev">Dev</SelectItem>
                <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
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
            
            <Button className="bg-primary-600 hover:bg-primary-700" data-testid="button-add-project">
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
      </CardContent>
    </Card>
  );
}
