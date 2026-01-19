import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
  ArrowLeft, 
  Target, 
  Calendar,
  TrendingUp,
  Edit2,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { type Goal, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoalModal } from "@/components/goals/goal-modal";

const statusColors = {
  'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Reviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Blocked': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Design Approval Needed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Temporary Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const departmentColors = {
  'Product': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Design': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Dev': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Marketing & Sales': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Bug Hunting Campaign': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

interface GoalProgress {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

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
      
      // Filter projects that are linked to this goal
      return allProjects.filter((project: Project) => 
        goal.taskIds.includes(project.id)
      );
    },
    enabled: !!goal?.taskIds
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/goals/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", goalId] });
      setIsEditModalOpen(false);
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

  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && progress?.progressPercentage < 100;

  const getProgressColor = (percentage: number) => {
    if (isOverdue && percentage < 100) return "bg-red-500";
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress':
      case 'Reviewing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/goals")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Goals
          </Button>
        </div>
        <Button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Goal
        </Button>
      </div>

      {/* Goal Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{goal.owner || "Unassigned"}</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Date</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {goal.targetDate ? (
                <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                  {isOverdue && <span className="ml-2 text-red-600">(Overdue)</span>}
                </span>
              ) : (
                <span>No target date set</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {format(new Date(goal.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {progress?.progressPercentage || 0}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress?.progressPercentage || 0)}`}
                  style={{ width: `${progress?.progressPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.totalTasks || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {progress?.completedTasks || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(progress?.totalTasks || 0) - (progress?.completedTasks || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Linked Tasks ({linkedTasks.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Tasks that contribute to this goal's progress
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="min-w-[200px]">Task</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Department</TableHead>
                <TableHead className="min-w-[120px]">Owner</TableHead>
                <TableHead className="min-w-[120px]">Due Date</TableHead>
                <TableHead className="min-w-[100px]">Progress</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : linkedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No tasks linked to this goal yet.
                  </TableCell>
                </TableRow>
              ) : (
                linkedTasks.map((task: Project) => (
                  <TableRow 
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <div className="max-w-[200px] truncate" title={task.task}>
                          {task.task}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={statusColors[task.status as keyof typeof statusColors]}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={departmentColors[task.department as keyof typeof departmentColors]}
                      >
                        {task.department}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.owner || '—'}</TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[35px]">
                          {task.completionPercentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/${task.department.toLowerCase().replace(' & ', '-').replace(' ', '-')}`)}
                        title="View in department"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Goal Modal */}
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