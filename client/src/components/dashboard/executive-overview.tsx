import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, Briefcase } from "lucide-react";
import { type Project } from "@shared/schema";

interface ExecutiveOverviewProps {
  projects: Project[];
  isLoading: boolean;
}

export function ExecutiveOverview({ projects, isLoading }: ExecutiveOverviewProps) {
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

  const getDepartmentColor = (department: string) => {
    const deptColors = {
      "Product": "bg-blue-600",
      "Design": "bg-purple-600", 
      "Dev": "bg-green-600",
      "Marketing & Sales": "bg-orange-600"
    };
    return deptColors[department as keyof typeof deptColors] || "bg-gray-600";
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

  // Group projects by department for better executive view
  const projectsByDepartment = projects.reduce((acc, project) => {
    if (!acc[project.department]) {
      acc[project.department] = [];
    }
    acc[project.department].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Project Overview by Department
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          All active projects across departments
        </p>
      </div>

      <div className="p-6 space-y-8">
        {Object.entries(projectsByDepartment).map(([department, deptProjects]) => (
          <div key={department} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${getDepartmentColor(department)}`}></div>
                {department} ({deptProjects.length} tasks)
              </h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deptProjects.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                const completion = getCompletionPercentage(project);
                
                return (
                  <div 
                    key={project.id} 
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`project-card-${project.id}`}
                  >
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white truncate" title={project.task}>
                          {project.task}
                        </h5>
                        <Badge variant={statusBadge.variant} className={`${statusBadge.className} mt-2`}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>{project.owner}</span>
                      </div>

                      {project.dueDate && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{project.dueDate}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-2" />
                      </div>

                      {project.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {project.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Projects will appear here once they are created in department tabs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}