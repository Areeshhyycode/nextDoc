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
  Play,
  Pause,
  Plus,
  Zap
} from "lucide-react";
import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type Sprint, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SprintModal } from "@/components/sprints/sprint-modal";

const statusColors = {
  'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Reviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Blocked': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Design Approval Needed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Temporary Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const sprintStatusColors = {
  'Planning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export function SprintDetailsPage() {
  const [match, params] = useRoute("/sprints/:id");
  const [, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sprintId = params?.id;

  const { data: sprint, isLoading: sprintLoading } = useQuery({
    queryKey: ["/api/sprints", sprintId],
    queryFn: async () => {
      const response = await fetch(`/api/sprints/${sprintId}`);
      if (!response.ok) throw new Error("Failed to fetch sprint");
      return response.json();
    },
    enabled: !!sprintId
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/sprints", sprintId, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/sprints/${sprintId}/progress`);
      if (!response.ok) throw new Error("Failed to fetch sprint progress");
      return response.json();
    },
    enabled: !!sprintId
  });

  const { data: allSprintTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/projects", "by-sprint", sprintId],
    queryFn: async () => {
      if (!sprint?.taskIds || sprint.taskIds.length === 0) return [];
      
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const allProjects = await response.json();
      
      return allProjects.filter((project: Project) => 
        sprint.taskIds.includes(project.id)
      );
    },
    enabled: !!sprint?.taskIds
  });

  // Filter tasks by team member
  const sprintTasks = useMemo(() => {
    if (selectedTeamMember === "all") {
      return allSprintTasks;
    }
    return allSprintTasks.filter((task: Project) => task.owner === selectedTeamMember);
  }, [allSprintTasks, selectedTeamMember]);

  const teamMembers = [
    { value: "all", label: "All Team Members" },
    { value: "Zara A", label: "Zara A" },
    { value: "Shaharyar Asgher", label: "Shaharyar Asgher" },
    { value: "Tom Austin", label: "Tom Austin" },
    { value: "Quang (Brett) Ngo", label: "Quang (Brett) Ngo" },
    { value: "Dillon Bong", label: "Dillon Bong" },
    { value: "Thuy (Sweet) Phan Thanh", label: "Thuy (Sweet) Phan Thanh" },
    { value: "heidi fung", label: "heidi fung" },
    { value: "Sam L", label: "Sam L" },
    { value: "Hinora", label: "Hinora" }
  ];

  const updateSprintMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/sprints/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", sprintId] });
      setIsEditModalOpen(false);
      toast({
        title: "Sprint Updated",
        description: "Sprint has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sprint.",
        variant: "destructive"
      });
    }
  });

  const autoAssignMutation = useMutation({
    mutationFn: (criteria: any) => apiRequest(`/api/sprints/${sprintId}/auto-assign`, "POST", criteria),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", sprintId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Tasks Auto-Assigned",
        description: `${data.count} tasks have been assigned to this sprint.`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to auto-assign tasks.",
        variant: "destructive"
      });
    }
  });

  if (!match) {
    return <div>Sprint not found</div>;
  }

  if (sprintLoading || progressLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center">Loading sprint details...</div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center text-red-600">Sprint not found</div>
      </div>
    );
  }

  const daysLeft = differenceInDays(new Date(sprint.endDate), new Date());
  const totalDays = differenceInDays(new Date(sprint.endDate), new Date(sprint.startDate));
  const daysPassed = totalDays - daysLeft;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
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

  // Generate burndown chart data
  const burndownData = [];
  const idealBurnRate = progress?.totalEffort ? progress.totalEffort / totalDays : 0;
  for (let day = 0; day <= Math.min(daysPassed, totalDays); day++) {
    const idealRemaining = Math.max(0, (progress?.totalEffort || 0) - (idealBurnRate * day));
    const actualRemaining = day === daysPassed ? ((progress?.totalEffort || 0) - (progress?.completedEffort || 0)) : idealRemaining;
    
    burndownData.push({
      day: `Day ${day}`,
      ideal: idealRemaining,
      actual: day <= daysPassed ? actualRemaining : null
    });
  }

  const handleAutoAssign = () => {
    autoAssignMutation.mutate({
      departments: ["Product", "Design", "Dev", "Marketing & Sales"],
      maxEffort: 50,
      prioritizeBy: 'risk'
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateSprintMutation.mutate({ id: sprint.id, status: newStatus });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/calendar")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
        </div>
        <div className="flex gap-3">
          {sprint.status === 'Planning' && (
            <Button 
              onClick={() => handleStatusChange('Active')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Sprint
            </Button>
          )}
          {sprint.status === 'Active' && (
            <Button 
              onClick={() => handleStatusChange('Completed')}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Sprint
            </Button>
          )}
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Sprint
          </Button>
        </div>
      </div>

      {/* Sprint Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sprint.name}
              </h1>
              {sprint.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {sprint.description}
                </p>
              )}
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={sprintStatusColors[sprint.status as keyof typeof sprintStatusColors]}
          >
            {sprint.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {format(new Date(sprint.startDate), 'MMM dd')} - {format(new Date(sprint.endDate), 'MMM dd')}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Remaining</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className={`font-medium ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : ''}`}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : 
                 daysLeft === 0 ? 'Due today' : 
                 `${daysLeft} days left`}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Team Members</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{sprint.teamMembers?.length || 0} members</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {format(new Date(sprint.createdAt), 'MMM dd, yyyy')}
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
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Target className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.totalTasks || 0}</div>
            <div className="text-sm text-gray-600">
              {progress?.completedTasks || 0} completed
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Story Points</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.totalEffort || 0}</div>
            <div className="text-sm text-gray-600">
              {progress?.completedEffort || 0} completed
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysPassed > 0 ? Math.round((progress?.completedEffort || 0) / daysPassed) : 0}
            </div>
            <div className="text-sm text-gray-600">pts/day</div>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      {sprint.status === 'Active' && burndownData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Burndown Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    stroke="#9CA3AF" 
                    strokeDasharray="5 5"
                    name="Ideal"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sprint Tasks ({sprintTasks.length})
                {selectedTeamMember !== "all" && (
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                    for {selectedTeamMember}
                  </span>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {selectedTeamMember === "all" 
                  ? "All tasks assigned to this sprint"
                  : `Tasks assigned to ${selectedTeamMember} in this sprint`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Team Member Filter */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[160px]"
                  data-testid="team-member-filter"
                >
                  {teamMembers.map(member => (
                    <option key={member.value} value={member.value}>
                      {member.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {sprint.status === 'Planning' && (
                <Button
                  onClick={handleAutoAssign}
                  disabled={autoAssignMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {autoAssignMutation.isPending ? "Auto-Assigning..." : "Auto-Assign Tasks"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="min-w-[200px]">Task</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Owner</TableHead>
                <TableHead className="min-w-[100px]">Effort</TableHead>
                <TableHead className="min-w-[120px]">Due Date</TableHead>
                <TableHead className="min-w-[100px]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : sprintTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {selectedTeamMember === "all" 
                      ? "No tasks assigned to this sprint yet."
                      : `No tasks assigned to ${selectedTeamMember} in this sprint.`
                    }
                    {selectedTeamMember !== "all" && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTeamMember("all")}
                          className="text-sm"
                        >
                          Show All Tasks
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sprintTasks.map((task: Project) => (
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
                    <TableCell>{task.owner || 'Unassigned'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {task.effortEstimate || 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(task.dueDate), 'MMM dd')}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Sprint Modal */}
      <SprintModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sprint={sprint}
        onSubmit={(data) => updateSprintMutation.mutate({ id: sprint.id, ...data })}
        isLoading={updateSprintMutation.isPending}
      />
    </div>
  );
}