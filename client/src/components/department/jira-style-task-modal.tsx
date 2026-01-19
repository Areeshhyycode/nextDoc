import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Target, Zap } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { insertProjectSchema, type Project, type InsertProject } from "@shared/schema";
import { DependencySelector } from "@/components/dependency/dependency-selector";
import { DependencyIndicator } from "@/components/dependency/dependency-indicator";

interface JiraStyleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  project?: Project;
  onSubmit: (data: InsertProject | Partial<Project>) => void;
  isLoading: boolean;
}

// Enhanced form schema with all required fields including dependencies
const taskFormSchema = z.object({
  task: z.string().min(1, "Task title is required"),
  status: z.string(),
  owner: z.string().optional(),
  stage: z.string(),
  dueDate: z.string().optional(),
  initiateDate: z.string().optional(),
  risk: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  department: z.string(),
  dependencies: z.array(z.string()).optional(),
  linkedGoalId: z.string().optional(),
  effortEstimate: z.number().min(1).max(100).optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

// Real team members for the assignee dropdown
const teamMembers = [
  "Zara A",
  "Shaharyar Asgher", 
  "Tom Austin",
  "Quang (Brett) Ngo",
  "Dillon Bong",
  "Thuy (Sweet) Phan Thanh",
  "heidi fung",
  "Sam L",
  "Hinora"
];

export function JiraStyleTaskModal({
  isOpen,
  onClose,
  department,
  project,
  onSubmit,
  isLoading,
}: JiraStyleTaskModalProps) {
  const isEditing = !!project;
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    project?.dependencies || []
  );

  // Fetch available goals for linking
  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    }
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: project?.task || "",
      status: project?.status || "Not Started",
      owner: project?.owner || "unassigned",
      stage: project?.stage || "Others",
      dueDate: project?.dueDate || "",
      initiateDate: "",
      risk: project?.risk || "none",
      notes: project?.notes || "",
      description: (project as any)?.description || "",
      department: department as any,
      dependencies: project?.dependencies || [],
      linkedGoalId: project?.linkedGoalId || "",
      effortEstimate: project?.effortEstimate || 1,
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    // Convert display values back to database-compatible values
    const submissionData = {
      ...data,
      owner: data.owner === "unassigned" ? "" : data.owner,
      risk: data.risk === "none" ? "" : data.risk,
      linkedGoalId: data.linkedGoalId === "none" ? "" : data.linkedGoalId,
      dependencies: selectedDependencies,
      department: department,
      status: data.status as any,
      effortEstimate: data.effortEstimate || 1
    } as any;
    onSubmit(submissionData);
  };

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        task: project?.task || "",
        status: project?.status || "Not Started",
        owner: project?.owner || "unassigned",
        stage: project?.stage || "Others",
        dueDate: project?.dueDate || "",
        risk: project?.risk || "none",
        notes: project?.notes || "",
        description: (project as any)?.description || "",
        department: department as any,
        dependencies: project?.dependencies || [],
        linkedGoalId: project?.linkedGoalId || "",
        effortEstimate: project?.effortEstimate || 1,
      });
      setSelectedDependencies(project?.dependencies || []);
    }
  }, [isOpen, project, department, form]);

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="task-modal">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            {isEditing 
              ? "Update the task details below" 
              : "Fill in the details to create a new task"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Task Title - Full Width */}
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title..."
                      {...field}
                      className="text-base"
                      data-testid="task-title-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Description - Full Width */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Describe what needs to be done, acceptance criteria, requirements..."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Two Column Layout for Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="status-select">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Reviewing">Reviewing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Risk Level */}
              <FormField
                control={form.control}
                name="risk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Risk Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="risk-select">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Second Row - Three Columns */}
            <div className="grid grid-cols-3 gap-4">
              {/* Stage */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stage
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="stage-select">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Others">Others</SelectItem>
                        <SelectItem value="Pre-Event">Pre-Event</SelectItem>
                        <SelectItem value="Day Of">Day Of</SelectItem>
                        <SelectItem value="Post-Event">Post-Event</SelectItem>
                        <SelectItem value="During Event">During Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Due Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="due-date-button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Initiate Date */}
              <FormField
                control={form.control}
                name="initiateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Initiate Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="initiate-date-button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Third Row - Assignee/Owner */}
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignee / Owner
                  </FormLabel>
                  {!showCustomAssignee ? (
                    <Select 
                      onValueChange={(value) => {
                        if (value === "__add_new__") {
                          setShowCustomAssignee(true);
                          field.onChange("");
                        } else {
                          field.onChange(value);
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="owner-select">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__">+ Add New Assignee</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter new assignee name"
                          value={customAssignee}
                          onChange={(e) => {
                            setCustomAssignee(e.target.value);
                            field.onChange(e.target.value);
                          }}
                          data-testid="custom-assignee-input"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomAssignee(false);
                          setCustomAssignee("");
                          field.onChange("unassigned");
                        }}
                        data-testid="cancel-custom-assignee"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Goal Linking */}
            <FormField
              control={form.control}
              name="linkedGoalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Link to Goal <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="goal-select">
                        <SelectValue placeholder="Select a goal to link to..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No goal linked</SelectItem>
                      {goals.map((goal: any) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{goal.title}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {goal.owner && `(${goal.owner})`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effort Estimate */}
            <FormField
              control={form.control}
              name="effortEstimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Effort Estimate <span className="text-gray-400">(story points)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      data-testid="effort-estimate-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dependencies Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Dependencies <span className="text-gray-400">(optional)</span>
              </h4>
              <DependencySelector
                selectedDependencies={selectedDependencies}
                onDependenciesChange={setSelectedDependencies}
                currentTaskId={project?.id}
                department={department}
              />
              {/* Show existing dependencies for editing */}
              {isEditing && project?.dependencies && project.dependencies.length > 0 && (
                <DependencyIndicator 
                  dependencies={project.dependencies}
                  className="mt-3"
                />
              )}
            </div>

            {/* Notes - Full Width */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="min-h-[80px] resize-none"
                      {...field}
                      data-testid="notes-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="submit-button"
              >
                {isLoading 
                  ? (isEditing ? "Updating..." : "Creating...") 
                  : (isEditing ? "Update Task" : "Create Task")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}