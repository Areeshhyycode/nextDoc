import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Users, Target } from "lucide-react";
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
import { insertSprintSchema, type Sprint } from "@shared/schema";

// Enhanced form schema for sprint creation/editing
const sprintFormSchema = insertSprintSchema.extend({
  name: z.string().min(1, "Sprint name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  teamMembers: z.array(z.string()).optional(),
  description: z.string().optional(),
});

type SprintFormData = z.infer<typeof sprintFormSchema>;

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint?: Sprint | null;
  onSubmit: (data: SprintFormData) => void;
  isLoading: boolean;
}

// Team members for sprint assignment
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

export function SprintModal({
  isOpen,
  onClose,
  sprint,
  onSubmit,
  isLoading,
}: SprintModalProps) {
  const isEditing = !!sprint;
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    sprint?.teamMembers || []
  );

  const form = useForm<SprintFormData>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: sprint?.name || "",
      description: sprint?.description || "",
      startDate: sprint?.startDate || "",
      endDate: sprint?.endDate || "",
      status: sprint?.status || "Planning",
      teamMembers: sprint?.teamMembers || [],
    },
  });

  const handleSubmit = (data: SprintFormData) => {
    const submissionData = {
      ...data,
      teamMembers: selectedTeamMembers,
    };
    onSubmit(submissionData);
  };

  const toggleTeamMember = (member: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(member) 
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: sprint?.name || "",
        description: sprint?.description || "",
        startDate: sprint?.startDate || "",
        endDate: sprint?.endDate || "",
        status: sprint?.status || "Planning",
        teamMembers: sprint?.teamMembers || [],
      });
      setSelectedTeamMembers(sprint?.teamMembers || []);
    }
  }, [isOpen, sprint, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {isEditing ? "Edit Sprint" : "Create New Sprint"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the sprint details below." 
              : "Set up a new sprint with timeline, team, and goals."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Sprint Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sprint Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sprint 1, Q1 Feature Sprint..."
                      {...field}
                      data-testid="sprint-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the sprint goals and objectives..."
                      className="min-h-[80px] resize-none"
                      {...field}
                      data-testid="sprint-description-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date *
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
                            data-testid="start-date-button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick start date</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date *
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
                            data-testid="end-date-button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick end date</span>
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
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < new Date(startDate) : date < new Date();
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        <SelectValue placeholder="Select sprint status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Members */}
            <div className="space-y-3">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members <span className="text-gray-400">(optional)</span>
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {teamMembers.map((member) => (
                  <label
                    key={member}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeamMembers.includes(member)}
                      onChange={() => toggleTeamMember(member)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{member}</span>
                  </label>
                ))}
              </div>
              {selectedTeamMembers.length > 0 && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedTeamMembers.length} team member{selectedTeamMembers.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>

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
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="submit-button"
              >
                {isLoading 
                  ? (isEditing ? "Updating..." : "Creating...") 
                  : (isEditing ? "Update Sprint" : "Create Sprint")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}