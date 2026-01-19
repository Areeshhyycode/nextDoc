import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Project } from "@shared/schema";

interface DependencyIndicatorProps {
  dependencies: string[];
  compact?: boolean; // For table view
  className?: string;
}

export function DependencyIndicator({ 
  dependencies, 
  compact = false, 
  className 
}: DependencyIndicatorProps) {
  // Fetch all projects to get dependency details
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  // Get dependency projects
  const dependencyProjects = allProjects.filter(project => 
    dependencies.includes(project.id)
  );

  // Categorize dependencies
  const completedDeps = dependencyProjects.filter(dep => dep.status === 'Completed');
  const incompleteDeps = dependencyProjects.filter(dep => dep.status !== 'Completed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'Blocked':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Reviewing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Compact view for table cells
  if (compact) {
    if (incompleteDeps.length === 0) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {dependencyProjects.length} deps ✓
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">All dependencies completed</p>
              {dependencyProjects.map(dep => (
                <div key={dep.id} className="text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {dep.task}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Waiting on {incompleteDeps.length}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-medium">Waiting on dependencies:</p>
            {incompleteDeps.map(dep => (
              <div key={dep.id} className="text-xs flex items-center gap-2">
                {getStatusIcon(dep.status)}
                <span>{dep.task}</span>
                <Badge variant="outline" className={getStatusColor(dep.status)}>
                  {dep.status}
                </Badge>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full view for task details
  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Dependencies ({dependencyProjects.length})
          </span>
          {incompleteDeps.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {incompleteDeps.length} pending
            </Badge>
          )}
          {incompleteDeps.length === 0 && dependencyProjects.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              All completed
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {dependencyProjects.map(project => (
            <Card 
              key={project.id} 
              className={`border-l-4 ${
                project.status === 'Completed' 
                  ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10' 
                  : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(project.status)}
                      <span className="text-sm font-medium">{project.task}</span>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{project.department}</span>
                      {project.owner && <span>• {project.owner}</span>}
                      {project.dueDate && <span>• Due: {project.dueDate}</span>}
                    </div>
                    {project.status !== 'Completed' && (
                      <div className="mt-1">
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          Waiting on Task #{project.id.slice(-6)}: {project.task}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    data-testid={`button-view-dependency-${project.id}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {incompleteDeps.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  This task is waiting on {incompleteDeps.length} dependencies
                </p>
                <p className="text-orange-700 dark:text-orange-300 mt-1">
                  It will be automatically unblocked when all dependencies are completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}