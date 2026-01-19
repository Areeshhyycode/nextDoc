import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { EnhancedDepartmentTable } from "./enhanced-department-table";
import { TaskModal } from "./task-modal";
import { DepartmentChart } from "./department-chart";
import { type Project, type InsertProject } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DepartmentPageProps {
  department: "Product" | "Design" | "Dev" | "Marketing & Sales";
  title: string;
  description: string;
  color: string;
}

export function DepartmentPage({ department, title, description, color }: DepartmentPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects', department],
    select: (data: Project[]) => data.filter(project => project.department === department)
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest('/api/projects', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      setIsModalOpen(false);
      toast({ description: "Task created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to create task" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      apiRequest(`/api/projects/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      setEditingProject(null);
      setIsModalOpen(false);
      toast({ description: "Task updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to update task" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/projects/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({ description: "Task deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to delete task" });
    }
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = (data: InsertProject) => {
    createMutation.mutate({ ...data, department });
  };

  const handleUpdateTask = (data: Partial<Project>) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    }
  };

  const handleEditTask = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="button-add-task"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Department Chart */}
      <DepartmentChart projects={projects} color={color} department={department} />

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <DepartmentTable
        projects={filteredProjects}
        isLoading={isLoading}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        color={color}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingProject ? handleUpdateTask : handleCreateTask}
        project={editingProject}
        department={department}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}