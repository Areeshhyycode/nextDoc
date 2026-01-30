import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Project, type InsertProject, type TeamMember, type KanbanColumn } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getDepartmentContextId } from "@shared/context-helpers";

export function useDepartmentData(department: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const contextId = getDepartmentContextId(department);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects', department],
    queryFn: async () => {
      const response = await fetch(`/api/projects?department=${encodeURIComponent(department)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const { data: kanbanColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ['/api/teams', contextId, 'kanban-columns'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${encodeURIComponent(contextId)}/kanban-columns`);
      if (!response.ok) {
        throw new Error('Failed to fetch kanban columns');
      }
      return response.json();
    },
  });

  const { data: viewPreference } = useQuery({
    queryKey: ['/api/teams', contextId, 'view-preference'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${encodeURIComponent(contextId)}/view-preference`);
      if (!response.ok) {
        throw new Error('Failed to fetch view preference');
      }
      return response.json();
    },
  });

  const [currentView, setCurrentView] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    if (viewPreference?.viewType) {
      setCurrentView(viewPreference.viewType);
    }
  }, [viewPreference]);

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
    queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest('POST', '/api/projects', data),
    onSuccess: () => {
      invalidateProjects();
      toast({ description: "Task created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to create task" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      apiRequest('PATCH', `/api/projects/${id}`, data),
    onSuccess: () => {
      invalidateProjects();
      toast({ description: "Task updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to update task" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/projects/${id}`),
    onSuccess: () => {
      invalidateProjects();
      toast({ description: "Task deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to delete task" });
    }
  });

  const updateViewPreferenceMutation = useMutation({
    mutationFn: (viewType: 'table' | 'kanban') =>
      apiRequest('POST', `/api/teams/${encodeURIComponent(contextId)}/view-preference`, { viewType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'view-preference'] });
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ projectId, columnName }: { projectId: string; columnName: string }) => {
      const updateData: { status?: string; scheduledDate?: string | null } = {};

      switch (columnName) {
        case 'New task':
          updateData.status = 'Not Started';
          updateData.scheduledDate = null;
          break;
        case 'Scheduled':
          updateData.status = 'Not Started';
          updateData.scheduledDate = new Date().toISOString().split('T')[0];
          break;
        case 'In Progress':
          updateData.status = 'In Progress';
          break;
        case 'Completed':
          updateData.status = 'Completed';
          break;
        default:
          updateData.status = 'In Progress';
      }

      return apiRequest('PATCH', `/api/projects/${projectId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      toast({ description: "Task moved successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to move task" });
    },
  });

  const createKanbanTaskMutation = useMutation({
    mutationFn: (taskData: {
      task: string;
      dueDate: string | null;
      owner: string | null;
      effortEstimate: number | null;
      taskType: string | null;
      status: string;
    }) => {
      const mappedStatus = taskData.status === 'New task' ? 'Not Started' : taskData.status;
      return apiRequest('POST', '/api/projects', {
        ...taskData,
        department,
        status: mappedStatus,
      });
    },
    onSuccess: () => {
      invalidateProjects();
      toast({ description: "Task created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to create task" });
    },
  });

  const renameKanbanColumnMutation = useMutation({
    mutationFn: ({ columnId, newName }: { columnId: string; newName: string }) =>
      apiRequest('PATCH', `/api/teams/${contextId}/kanban-columns/${columnId}`, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column renamed successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to rename column" });
    },
  });

  const deleteKanbanColumnMutation = useMutation({
    mutationFn: (columnId: string) =>
      apiRequest('DELETE', `/api/teams/${contextId}/kanban-columns/${columnId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to delete column" });
    },
  });

  const addKanbanColumnMutation = useMutation({
    mutationFn: ({ name, icon, color }: { name: string; icon: string; color: string }) =>
      apiRequest('POST', `/api/teams/${contextId}/kanban-columns`, {
        teamId: contextId,
        name,
        icon,
        color,
        order: kanbanColumns.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column added successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to add column" });
    },
  });

  const handleViewChange = (view: 'table' | 'kanban') => {
    setCurrentView(view);
    updateViewPreferenceMutation.mutate(view);
  };

  return {
    projects,
    isLoading,
    teamMembers,
    kanbanColumns,
    contextId,
    currentView,
    handleViewChange,
    createMutation,
    updateMutation,
    deleteMutation,
    moveCardMutation,
    createKanbanTaskMutation,
    renameKanbanColumnMutation,
    deleteKanbanColumnMutation,
    addKanbanColumnMutation,
  };
}
