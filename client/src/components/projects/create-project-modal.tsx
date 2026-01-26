import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, Lock, Users as UsersIcon, Globe, UserPlus, Search } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InviteModal } from "@/components/admin/invite-modal";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { COLOR_PRESET_VALUES, DEFAULT_COLOR } from "@/constants/color-presets";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StepIndicator } from "@/components/ui/step-indicator";
import { SelectionCard } from "@/components/ui/selection-card";
import { CountBadge } from "@/components/ui/count-badge";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom SVG icons for layouts
const ListViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="12" width="32" height="4" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="8" y="22" width="32" height="4" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="8" y="32" width="32" height="4" rx="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const KanbanViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="6" y="8" width="10" height="32" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="19" y="8" width="10" height="24" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="32" y="8" width="10" height="28" rx="2" fill="currentColor" opacity="0.7"/>
  </svg>
);

const GanttViewIcon = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="10" width="16" height="4" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="18" width="20" height="4" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="10" y="26" width="24" height="4" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="14" y="34" width="18" height="4" rx="2" fill="currentColor" opacity="0.8"/>
  </svg>
);

const LAYOUT_OPTIONS = [
  { id: "list", name: "List View", description: "View actions in a list", icon: ListViewIcon },
  { id: "kanban", name: "Kanban View", description: "Track the status of each action", icon: KanbanViewIcon },
  { id: "gantt", name: "Gantt View", description: "View actions in gantt chart", icon: GanttViewIcon },
];

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
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberPopover, setShowMemberPopover] = useState(false);
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
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      handleClose();
      navigate(`/projects/${project.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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

          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-[1fr_auto] gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project name</Label>
                  <Input
                    id="project-name"
                    placeholder="New project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    data-testid="input-project-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-20 h-10 rounded-md border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: projectColor }}
                        data-testid="button-project-color"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_PRESET_VALUES.map((color) => (
                          <button
                            key={color}
                            className="w-10 h-10 rounded-md border-2 border-transparent hover:border-gray-400 transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={() => setProjectColor(color)}
                            data-testid={`color-${color}`}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project dates</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                        data-testid="button-start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        data-testid="button-end-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <StepIndicator totalSteps={3} currentStep={1} className="pt-4" />
            </div>
          )}

          {/* Step 2: Invite Members */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Projects are better with others!{" "}
                  <span
                    className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={() => setShowInviteModal(true)}
                  >
                    Add a new workspace member.
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <SelectionCard
                  isSelected={privacy === "private"}
                  onClick={() => setPrivacy("private")}
                  icon={Lock}
                  title="Private to me"
                  description="Only you will be able to view this project and its actions."
                  testId="privacy-private"
                />

                <SelectionCard
                  isSelected={privacy === "specific_people"}
                  onClick={() => setPrivacy("specific_people")}
                  icon={UsersIcon}
                  title="Specific people"
                  description="Invite specific people to your project. You can edit project member permissions later."
                  testId="privacy-specific-people"
                >
                  {privacy === "specific_people" && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMemberPopover(!showMemberPopover);
                        }}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        data-testid="button-select-members"
                      >
                        <UsersIcon className="h-4 w-4" />
                        Select members
                        <CountBadge count={selectedMembers.length} />
                      </button>

                      {showMemberPopover && (
                        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-lg" onClick={(e) => e.stopPropagation()}>
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search name or email"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="pl-9 h-8 text-sm"
                                data-testid="input-member-search"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1">
                            <div className="text-xs font-medium text-gray-500 px-2 py-1.5">Workspace members</div>
                            {users
                              .filter(user =>
                                user.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                user.email.toLowerCase().includes(memberSearch.toLowerCase())
                              )
                              .map((user) => (
                                <button
                                  key={user.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMember(user.id);
                                  }}
                                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  data-testid={`member-${user.id}`}
                                >
                                  <UserAvatar name={user.displayName} size="sm" />
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="text-xs font-medium truncate">{user.displayName}</div>
                                  </div>
                                  <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                                    {selectedMembers.includes(user.id) && (
                                      <Check className="h-3 w-3 text-blue-500" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMemberPopover(false);
                                setShowInviteModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors mt-1"
                              data-testid="button-invite-new-member"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              Invite new teammate
                            </button>
                          </div>
                          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMemberPopover(false);
                              }}
                              className="w-full h-8 text-sm"
                              data-testid="button-close-member-popover"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </SelectionCard>

                <SelectionCard
                  isSelected={privacy === "everyone"}
                  onClick={() => setPrivacy("everyone")}
                  icon={Globe}
                  title="Everyone"
                  description="Invite all members in your workspace to this project."
                  testId="privacy-everyone"
                />
              </div>

              <StepIndicator totalSteps={3} currentStep={2} className="pt-4" />
            </div>
          )}

          {/* Step 3: Choose Layout */}
          {step === 3 && (
            <div className="space-y-6 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can change the default view anytime.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = defaultLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => setDefaultLayout(layout.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                      data-testid={`layout-${layout.id}`}
                    >
                      <div className={cn(
                        "w-full h-24 rounded-md flex items-center justify-center",
                        isSelected ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        <Icon className={cn(
                          "w-12 h-12",
                          isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                        )} />
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {layout.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {layout.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <StepIndicator totalSteps={3} currentStep={3} className="pt-4" />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
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
