import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, Briefcase } from "lucide-react";
import { type Project } from "@shared/schema";
import { getStatusConfig } from "@/constants/colors";

interface ExecutiveOverviewProps {
  projects: Project[];
  isLoading: boolean;
}

// Department badge colors (different from department config colors)
const DEPARTMENT_BADGE_COLORS: Record<string, string> = {
  "Product": "bg-blue-600",
  "Design": "bg-purple-600",
  "Dev": "bg-green-600",
  "Marketing & Sales": "bg-orange-600"
};

export function ExecutiveOverview({ projects, isLoading }: ExecutiveOverviewProps) {
  const getStatusBadge = (status: string) => getStatusConfig(status);

  const getDepartmentColor = (department: string) => {
    return DEPARTMENT_BADGE_COLORS[department] || "bg-gray-600";
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Project Overview by Department
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          All active projects across departments
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {Object.entries(projectsByDepartment).map(([department, deptProjects]) => (
          <div key={department} className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${getDepartmentColor(department)}`}></div>
                <span className="truncate">{department} ({deptProjects.length} tasks)</span>
              </h4>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {deptProjects.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                const completion = getCompletionPercentage(project);
                
                return (
                  <div
                    key={project.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md active:bg-gray-50 dark:active:bg-gray-700 transition-all"
                    data-testid={`project-card-${project.id}`}
                  >
                    <div className="space-y-2.5 sm:space-y-3">
                      <div>
                        <h5 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate" title={project.task}>
                          {project.task}
                        </h5>
                        <Badge variant={statusBadge.variant} className={`${statusBadge.className} mt-1.5 sm:mt-2 text-xs`}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">{project.owner}</span>
                      </div>

                      {project.dueDate && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span>{project.dueDate}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-1.5 sm:h-2" />
                      </div>

                      {project.notes && (
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
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
          <div className="text-center py-8 sm:py-12">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
              Projects will appear here once they are created in department tabs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}