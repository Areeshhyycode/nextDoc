import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Target, 
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { type Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoalModal } from "@/components/goals/goal-modal";
import { useLocation } from "wouter";

interface GoalWithProgress extends Goal {
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
}

export function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    }
  });

  // Fetch progress for each goal
  const { data: goalsWithProgress = [] } = useQuery({
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

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/goals", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsCreateModalOpen(false);
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
      setIsEditModalOpen(false);
      setEditingGoal(null);
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

  const filteredGoals = goalsWithProgress.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.owner?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(id);
    }
  };

  const getProgressColor = (percentage: number, isOverdue: boolean) => {
    if (isOverdue && percentage < 100) return "bg-red-500";
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getProgressBadgeColor = (percentage: number, isOverdue: boolean) => {
    if (isOverdue && percentage < 100) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (percentage === 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (percentage >= 70) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Goals & OKRs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track objectives and key results across your organization
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="create-goal-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalsWithProgress.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {goalsWithProgress.filter(g => g.progressPercentage === 100).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {goalsWithProgress.filter(g => g.progressPercentage > 0 && g.progressPercentage < 100).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {goalsWithProgress.filter(g => g.progressPercentage === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search goals by title, description, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-goals"
          />
        </div>
      </div>

      {/* Goals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="min-w-[200px]">Goal</TableHead>
                <TableHead className="min-w-[120px]">Owner</TableHead>
                <TableHead className="min-w-[150px]">Progress</TableHead>
                <TableHead className="min-w-[100px]">Tasks</TableHead>
                <TableHead className="min-w-[120px]">Target Date</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading goals...
                  </TableCell>
                </TableRow>
              ) : filteredGoals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery ? "No goals match your search." : "No goals yet. Click 'New Goal' to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGoals.map((goal) => {
                  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.progressPercentage < 100;
                  
                  return (
                    <TableRow 
                      key={goal.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setLocation(`/goals/${goal.id}`)}
                      data-testid={`goal-row-${goal.id}`}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{goal.title}</div>
                          {goal.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                              {goal.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {goal.owner || "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progressPercentage, !!isOverdue)}`}
                                style={{ width: `${goal.progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[35px]">
                              {goal.progressPercentage}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{goal.completedTasks}/{goal.totalTasks}</div>
                          <div className="text-gray-500">tasks</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {goal.targetDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={getProgressBadgeColor(goal.progressPercentage, !!isOverdue)}
                        >
                          {isOverdue ? 'Overdue' : 
                           goal.progressPercentage === 100 ? 'Completed' :
                           goal.progressPercentage > 0 ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(goal);
                            }}
                            data-testid={`edit-goal-${goal.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(goal.id);
                            }}
                            data-testid={`delete-goal-${goal.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createGoalMutation.mutate(data)}
        isLoading={createGoalMutation.isPending}
      />

      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSubmit={(data) => updateGoalMutation.mutate({ id: editingGoal?.id, ...data })}
        isLoading={updateGoalMutation.isPending}
      />
    </div>
  );
}