import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { type Project, type InsertProject, insertProjectSchema } from "@shared/schema";

const taskFormSchema = insertProjectSchema.extend({
  completionPercentage: z.number().min(0).max(100).default(0),
  initiateDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  project?: Project | null;
  department: string;
  isLoading: boolean;
}

const statusOptions = [
  "Not Started",
  "In Progress", 
  "Reviewing",
  "Design Approval Needed",
  "Completed",
  "Blocked",
  "Temporary Hold"
];

const ownerOptions = [
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

export function TaskModal({ isOpen, onClose, onSubmit, project, department, isLoading }: TaskModalProps) {
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState("");

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: project?.task || "",
      department: department as any,
      status: project?.status || "Not Started",
      owner: project?.owner || "",
      stage: project?.stage || "Others",
      dueDate: project?.dueDate || "",
      initiateDate: "",
      completionPercentage: project?.completionPercentage || 0,
      risk: project?.risk || "",
      notes: project?.notes || "",
      description: (project as any)?.description || "",
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    if (!project) {
      form.reset();
    }
  };

  const watchedCompletion = form.watch("completionPercentage");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title..." {...field} data-testid="input-task-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee / Owner</FormLabel>
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
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-owner">
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ownerOptions.map((owner) => (
                            <SelectItem key={owner} value={owner}>
                              {owner}
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
                            field.onChange("");
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

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/DD/YYYY" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-due-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initiateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initiate Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/DD/YYYY" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-initiate-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <FormControl>
                      <Input placeholder="Project stage..." {...field} value={field.value || ""} data-testid="input-stage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="completionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Percentage: {watchedCompletion}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                      data-testid="slider-completion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="risk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-risk">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter task description with formatting..."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      className="resize-none" 
                      rows={2}
                      {...field} 
                      value={field.value || ""}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save">
                {isLoading ? "Saving..." : project ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}