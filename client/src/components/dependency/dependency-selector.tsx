import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, X, AlertTriangle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

interface DependencySelectorProps {
  selectedDependencies: string[];
  onDependenciesChange: (dependencies: string[]) => void;
  currentTaskId?: string; // To exclude current task from dependencies
  department?: string; // To show department-related tasks first
  className?: string;
}

export function DependencySelector({
  selectedDependencies,
  onDependenciesChange,
  currentTaskId,
  department,
  className
}: DependencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all projects for dependency selection
  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter projects for dependency selection
  const availableProjects = allProjects.filter(project => {
    // Exclude current task
    if (currentTaskId && project.id === currentTaskId) return false;
    
    // Exclude already selected dependencies
    if (selectedDependencies.includes(project.id)) return false;
    
    // Search filter
    if (searchTerm && !project.task.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort projects: same department first, then by status, then by name
  const sortedProjects = availableProjects.sort((a, b) => {
    // Prioritize same department
    if (department) {
      if (a.department === department && b.department !== department) return -1;
      if (b.department === department && a.department !== department) return 1;
    }
    
    // Then by status (Completed first, then In Progress, etc.)
    const statusOrder = {
      'Completed': 0,
      'In Progress': 1,
      'Reviewing': 2,
      'Not Started': 3,
      'Blocked': 4,
      'Temporary Hold': 5
    };
    
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Finally by task name
    return a.task.localeCompare(b.task);
  });

  // Get selected dependency projects for display
  const selectedProjects = allProjects.filter(project => 
    selectedDependencies.includes(project.id)
  );

  const handleSelectDependency = (projectId: string) => {
    onDependenciesChange([...selectedDependencies, projectId]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleRemoveDependency = (projectId: string) => {
    onDependenciesChange(selectedDependencies.filter(id => id !== projectId));
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

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected Dependencies */}
      {selectedProjects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Dependencies ({selectedProjects.length})
          </h4>
          <div className="space-y-2">
            {selectedProjects.map(project => (
              <Card key={project.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link className="h-3 w-3 text-blue-500" />
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
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            This dependency is not yet completed
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDependency(project.id)}
                      className="ml-2 h-6 w-6 p-0"
                      data-testid={`button-remove-dependency-${project.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Dependency Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
            data-testid="button-add-dependency"
          >
            <Search className="mr-2 h-4 w-4" />
            {selectedProjects.length === 0 
              ? "Add task dependencies..." 
              : "Add another dependency..."
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search tasks..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading tasks..." : "No tasks found."}
              </CommandEmpty>
              {sortedProjects.length > 0 && (
                <CommandGroup heading="Available Tasks">
                  {sortedProjects.slice(0, 10).map(project => (
                    <CommandItem
                      key={project.id}
                      value={project.task}
                      onSelect={() => handleSelectDependency(project.id)}
                      className="cursor-pointer"
                      data-testid={`option-dependency-${project.id}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{project.task}</span>
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{project.department}</span>
                            {project.owner && <span>• {project.owner}</span>}
                          </div>
                        </div>
                        <Check className="ml-2 h-4 w-4" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        This task will be automatically blocked if any selected dependencies are not completed.
        When all dependencies are completed, the task will be unblocked automatically.
      </p>
    </div>
  );
}