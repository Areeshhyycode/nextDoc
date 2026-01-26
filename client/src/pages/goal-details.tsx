import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import type { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  GoalModal,
  GoalDetailsHeader,
  GoalInfoCard,
  GoalProgressCards,
  LinkedTasksTable,
  getProgressColor,
  checkIsOverdue
} from "@/components/goals";

export function GoalDetailsPage() {
  const [match, params] = useRoute("/goals/:id");
  const [, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const goalId = params?.id;

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["/api/goals", goalId],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}`);
      if (!response.ok) throw new Error("Failed to fetch goal");
      return response.json();
    },
    enabled: !!goalId
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/goals", goalId, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}/progress`);
      if (!response.ok) throw new Error("Failed to fetch goal progress");
      return response.json();
    },
    enabled: !!goalId
  });

  const { data: linkedTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/projects", "by-goal", goalId],
    queryFn: async () => {
      if (!goal?.taskIds || goal.taskIds.length === 0) return [];
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const allProjects = await response.json();
      return allProjects.filter((project: Project) => goal.taskIds.includes(project.id));
    },
    enabled: !!goal?.taskIds
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/goals/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", goalId] });
      setIsEditModalOpen(false);
      toast({ title: "Goal Updated", description: "Goal has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update goal.", variant: "destructive" });
    }
  });

  if (!match) {
    return <div>Goal not found</div>;
  }

  if (goalLoading || progressLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center">Loading goal details...</div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center text-red-600">Goal not found</div>
      </div>
    );
  }

  const isOverdue = checkIsOverdue(goal.targetDate, progress);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <GoalDetailsHeader
        onBack={() => setLocation("/goals")}
        onEdit={() => setIsEditModalOpen(true)}
      />

      <GoalInfoCard goal={goal} isOverdue={isOverdue} />

      <GoalProgressCards
        progress={progress}
        getProgressColor={(percentage) => getProgressColor(isOverdue, percentage)}
      />

      <LinkedTasksTable
        tasks={linkedTasks}
        isLoading={tasksLoading}
        onNavigate={setLocation}
      />

      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        goal={goal}
        onSubmit={(data) => updateGoalMutation.mutate({ id: goal.id, ...data })}
        isLoading={updateGoalMutation.isPending}
      />
    </div>
  );
}
