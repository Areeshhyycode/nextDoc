import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface GoalWithProgress extends Goal {
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
}

export function useGoals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    }
  });

  // Fetch goals with progress
  const { data: goalsWithProgress = [] } = useQuery<GoalWithProgress[]>({
    queryKey: ["/api/goals", "with-progress"],
    queryFn: async () => {
      const goalsWithProgressData: GoalWithProgress[] = [];

      for (const goal of goals) {
        try {
          const progressResponse = await fetch(`/api/goals/${goal.id}/progress`);
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            goalsWithProgressData.push({
              ...goal,
              progressPercentage: progress.progressPercentage,
              totalTasks: progress.totalTasks,
              completedTasks: progress.completedTasks
            });
          } else {
            goalsWithProgressData.push({
              ...goal,
              progressPercentage: 0,
              totalTasks: 0,
              completedTasks: 0
            });
          }
        } catch (error) {
          goalsWithProgressData.push({
            ...goal,
            progressPercentage: 0,
            totalTasks: 0,
            completedTasks: 0
          });
        }
      }

      return goalsWithProgressData;
    },
    enabled: goals.length > 0
  });

  return {
    goals,
    goalsWithProgress,
    isLoading
  };
}

export function useGoalMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/goals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Created",
        description: "Goal has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal.",
        variant: "destructive"
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/goals/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Updated",
        description: "Goal has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal.",
        variant: "destructive"
      });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/goals/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Deleted",
        description: "Goal has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive"
      });
    }
  });

  return {
    createGoal: createGoalMutation,
    updateGoal: updateGoalMutation,
    deleteGoal: deleteGoalMutation
  };
}

export function useGoalFiltering(goalsWithProgress: GoalWithProgress[], searchQuery: string) {
  return goalsWithProgress.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.owner?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
