import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InviteModal } from "@/components/admin/invite-modal";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { DEFAULT_COLOR } from "@/constants/color-presets";

import { StepProjectDetails } from "./create-project/StepProjectDetails";
import { StepInviteMembers } from "./create-project/StepInviteMembers";
import { StepChooseLayout } from "./create-project/StepChooseLayout";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState(DEFAULT_COLOR);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [privacy, setPrivacy] = useState<"private" | "everyone" | "specific_people">("everyone");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [defaultLayout, setDefaultLayout] = useState<"list" | "kanban" | "gantt">("list");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/workspace-projects", data);
      return await response.json();
    },
    onSuccess: (project: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace-projects"] });
      toast({ title: "Success", description: "Project created successfully!" });
      handleClose();
      navigate(`/projects/${project.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setStep(1);
    setProjectName("");
    setProjectColor(DEFAULT_COLOR);
    setStartDate(undefined);
    setEndDate(undefined);
    setPrivacy("private");
    setSelectedMembers([]);
    setDefaultLayout("list");
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === 1 && !projectName.trim()) {
      toast({ title: "Error", description: "Project name is required", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handleCreate = () => {
    createProjectMutation.mutate({
      name: projectName,
      color: projectColor,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
      privacy,
      memberIds: privacy === "specific_people" ? selectedMembers : [],
      defaultLayout,
    });
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <>
      <InviteModal open={showInviteModal} onOpenChange={setShowInviteModal} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {step === 1 && "Create new project"}
              {step === 2 && "Invite project members"}
              {step === 3 && "Choose project layout"}
            </DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <StepProjectDetails
              projectName={projectName}
              onProjectNameChange={setProjectName}
              projectColor={projectColor}
              onProjectColorChange={setProjectColor}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
            />
          )}

          {step === 2 && (
            <StepInviteMembers
              privacy={privacy}
              onPrivacyChange={setPrivacy}
              selectedMembers={selectedMembers}
              onToggleMember={toggleMember}
              users={users}
              onShowInviteModal={() => setShowInviteModal(true)}
            />
          )}

          {step === 3 && (
            <StepChooseLayout
              defaultLayout={defaultLayout}
              onLayoutChange={setDefaultLayout}
            />
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} data-testid="button-next">
                {step === 1 && "Next: Project members"}
                {step === 2 && "Next: Choose layout"}
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={createProjectMutation.isPending}
                data-testid="button-create-project"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create project"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
