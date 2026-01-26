import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { differenceInDays } from "date-fns";
import type { Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SprintModal } from "@/components/sprints/sprint-modal";
import {
  SprintDetailsHeader,
  SprintInfoCard,
  SprintProgressCards,
  BurndownChart,
  SprintTasksTable,
  generateBurndownData
} from "@/components/sprints/details";

const TEAM_MEMBERS = [
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

export function SprintDetailsPage() {
  const [match, params] = useRoute("/sprints/:id");
  const [, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("all");
  const { toast } = useToast();

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
      return allProjects.filter((project: Project) => sprint.taskIds.includes(project.id));
    },
    enabled: !!sprint?.taskIds
  });

  const sprintTasks = useMemo(() => {
    if (selectedTeamMember === "all") return allSprintTasks;
    return allSprintTasks.filter((task: Project) => task.owner === selectedTeamMember);
  }, [allSprintTasks, selectedTeamMember]);

  const updateSprintMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/sprints/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", sprintId] });
      setIsEditModalOpen(false);
      toast({ title: "Sprint Updated", description: "Sprint has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update sprint.", variant: "destructive" });
    }
  });

  const autoAssignMutation = useMutation({
    mutationFn: (criteria: any) => apiRequest(`/api/sprints/${sprintId}/auto-assign`, "POST", criteria),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", sprintId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Tasks Auto-Assigned", description: `${data.count} tasks have been assigned to this sprint.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to auto-assign tasks.", variant: "destructive" });
    }
  });

  if (!match) return <div>Sprint not found</div>;

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

  const burndownData = sprint.status === 'Active'
    ? generateBurndownData(
        progress?.totalEffort || 0,
        progress?.completedEffort || 0,
        totalDays,
        daysPassed
      )
    : [];

  const handleStatusChange = (newStatus: string) => {
    updateSprintMutation.mutate({ id: sprint.id, status: newStatus });
  };

  const handleAutoAssign = () => {
    autoAssignMutation.mutate({
      departments: ["Product", "Design", "Dev", "Marketing & Sales"],
      maxEffort: 50,
      prioritizeBy: 'risk'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SprintDetailsHeader
        status={sprint.status}
        onBack={() => setLocation("/calendar")}
        onStartSprint={() => handleStatusChange('Active')}
        onCompleteSprint={() => handleStatusChange('Completed')}
        onEdit={() => setIsEditModalOpen(true)}
      />

      <SprintInfoCard sprint={sprint} daysLeft={daysLeft} />

      <SprintProgressCards progress={progress} daysPassed={daysPassed} />

      {sprint.status === 'Active' && <BurndownChart data={burndownData} />}

      <SprintTasksTable
        tasks={sprintTasks}
        isLoading={tasksLoading}
        selectedTeamMember={selectedTeamMember}
        teamMembers={TEAM_MEMBERS}
        sprintStatus={sprint.status}
        onTeamMemberChange={setSelectedTeamMember}
        onAutoAssign={handleAutoAssign}
        isAutoAssigning={autoAssignMutation.isPending}
      />

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
