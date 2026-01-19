import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
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
import { insertGoalSchema, type Goal } from "@shared/schema";

// Enhanced form schema for goal creation/editing
const goalFormSchema = insertGoalSchema.extend({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  owner: z.string().optional(),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSubmit: (data: GoalFormData) => void;
  isLoading: boolean;
}

// Team members for owner selection
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

export function GoalModal({
  isOpen,
  onClose,
  goal,
  onSubmit,
  isLoading,
}: GoalModalProps) {
  const isEditing = !!goal;
  const [showCustomOwner, setShowCustomOwner] = useState(false);
  const [customOwner, setCustomOwner] = useState("");

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      owner: goal?.owner || "unassigned",
      targetDate: goal?.targetDate || "",
    },
  });

  const handleSubmit = (data: GoalFormData) => {
    // Convert display values back to database-compatible values
    const submissionData = {
      ...data,
      owner: data.owner === "unassigned" ? "" : data.owner,
    };
    onSubmit(submissionData);
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: goal?.title || "",
        description: goal?.description || "",
        owner: goal?.owner || "unassigned",
        targetDate: goal?.targetDate || "",
      });
      setShowCustomOwner(false);
      setCustomOwner("");
    }
  }, [isOpen, goal, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the goal details below." 
              : "Define a new objective with clear targets and deadlines."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Goal Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Goal Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter goal title..."
                      {...field}
                      data-testid="goal-title-input"
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
                      placeholder="Describe the goal and key results..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      data-testid="goal-description-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner and Target Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner */}
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Goal Owner
                    </FormLabel>
                    {!showCustomOwner ? (
                      <Select 
                        onValueChange={(value) => {
                          if (value === "__add_new__") {
                            setShowCustomOwner(true);
                            field.onChange("");
                          } else {
                            field.onChange(value);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="goal-owner-select">
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__">+ Add New Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="Enter owner name"
                            value={customOwner}
                            onChange={(e) => {
                              setCustomOwner(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            data-testid="custom-owner-input"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCustomOwner(false);
                            setCustomOwner("");
                            field.onChange("unassigned");
                          }}
                          data-testid="cancel-custom-owner"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Date */}
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Date <span className="text-gray-400">(optional)</span>
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
                            data-testid="target-date-button"
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a target date</span>
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
                  : (isEditing ? "Update Goal" : "Create Goal")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}