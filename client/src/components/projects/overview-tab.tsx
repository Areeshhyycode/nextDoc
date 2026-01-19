import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Upload, CalendarIcon, Filter, Bold, Italic, List, ListOrdered, Smile, FileText, Download, MoreVertical, ExternalLink, Link as LinkIcon, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ProjectStatusUpdate, WorkspaceProject, ProjectAttachment } from "@shared/schema";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ProjectActivityFeed } from "./project-activity";
import { ObjectUploader } from "@/components/ObjectUploader";
import { BudgetOverview } from "./budget-overview";

interface OverviewTabProps {
  project: WorkspaceProject;
  projectId: string;
}

export function OverviewTab({ project, projectId }: OverviewTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Status update inline form state
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("on_track");
  const [statusDescription, setStatusDescription] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Rich text editor for status description
  const statusEditor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      setStatusDescription(editor.getHTML());
    },
  });

  // Description edit state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(project.description || "");
  const [showDescriptionEmojiPicker, setShowDescriptionEmojiPicker] = useState(false);

  // Rich text editor for project description
  const descriptionEditor = useEditor({
    extensions: [StarterKit],
    content: project.description || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
  });

  // Fetch status updates
  const { data: statusUpdates = [] } = useQuery<ProjectStatusUpdate[]>({
    queryKey: ["/api/project-status-updates", projectId],
  });

  // Fetch attachments
  const { data: attachments = [] } = useQuery<ProjectAttachment[]>({
    queryKey: ["/api/project-attachments", projectId],
  });

  // Get latest status
  const latestStatus = statusUpdates[0];

  // Status update mutation
  const createStatusMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/project-status-updates", data);
    },
    onSuccess: async (_, variables) => {
      // Log activity
      try {
        await apiRequest("POST", "/api/project-activities", {
          projectId,
          userId: user?.id,
          activityType: "status_changed",
          entityName: project.name,
          oldValue: latestStatus?.status || "none",
          newValue: variables.status,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/project-activities", projectId] });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/project-status-updates", projectId] });
      toast({ title: "Success", description: "Status updated successfully" });
      setShowStatusForm(false);
      setSelectedStatus("on_track");
      setStatusDescription("");
      statusEditor?.commands.clearContent();
    },
  });

  // Description mutation
  const updateDescriptionMutation = useMutation({
    mutationFn: async (desc: string) => {
      return await apiRequest("PATCH", `/api/workspace-projects/${projectId}`, { description: desc });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace-projects", projectId] });
      toast({ title: "Success", description: "Description updated successfully" });
      setIsEditingDescription(false);
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      return await apiRequest("DELETE", `/api/project-attachments/${attachmentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-attachments", projectId] });
      toast({ title: "Success", description: "Attachment removed successfully" });
    },
  });

  const handleStatusSubmit = () => {
    if (!user?.id) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      return;
    }
    createStatusMutation.mutate({
      projectId,
      status: selectedStatus,
      description: statusDescription,
      userId: user.id,
    });
  };

  const handleDescriptionSave = () => {
    updateDescriptionMutation.mutate(description);
  };

  const handleGetUploadParameters = async () => {
    try {
      const res = await apiRequest("POST", "/api/objects/upload", {});
      const data = await res.json() as { uploadURL: string };
      console.log("API response:", data);
      
      if (!data || !data.uploadURL) {
        console.error("Invalid response from upload API:", data);
        throw new Error("Invalid upload URL received");
      }
      
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  };

  const handleUploadComplete = async (files: Array<{ name: string; size: number; uploadURL: string }>) => {
    for (const file of files) {
      try {
        await apiRequest("POST", "/api/project-attachments", {
          projectId,
          fileName: file.name,
          fileUrl: file.uploadURL,
          fileSize: file.size,
        });
      } catch (error) {
        console.error("Failed to save attachment:", error);
        toast({ title: "Error", description: `Failed to save ${file.name}`, variant: "destructive" });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["/api/project-attachments", projectId] });
    toast({ title: "Success", description: "Files uploaded successfully" });
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Success", description: "Link copied to clipboard" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    // For now, just use FileText icon for all files
    // You can customize this based on file type if needed
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "bg-green-500";
      case "at_risk":
        return "bg-red-500";
      case "off_track":
        return "bg-orange-500";
      case "on_hold":
        return "bg-gray-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on_track":
        return "On-track";
      case "at_risk":
        return "At risk";
      case "off_track":
        return "Off-track";
      case "on_hold":
        return "On-hold";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project overview</h2>

      {/* Status Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
          {!showStatusForm && (
            <button
              onClick={() => setShowStatusForm(true)}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
              data-testid="button-new-status"
            >
              New status update
            </button>
          )}
        </div>

        {showStatusForm ? (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="select-status" className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      On track
                    </div>
                  </SelectItem>
                  <SelectItem value="at_risk">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      At risk
                    </div>
                  </SelectItem>
                  <SelectItem value="off_track">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Off track
                    </div>
                  </SelectItem>
                  <SelectItem value="on_hold">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      On hold
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2">Status Description</Label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md" data-testid="editor-status-description">
                {/* Toolbar */}
                {statusEditor && (
                  <div className="border-b border-gray-300 dark:border-gray-600 p-2 flex items-center gap-1 bg-gray-50 dark:bg-gray-900">
                    <button
                      onClick={() => statusEditor.chain().focus().toggleBold().run()}
                      className={cn(
                        "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                        statusEditor.isActive("bold") && "bg-gray-200 dark:bg-gray-700"
                      )}
                      type="button"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => statusEditor.chain().focus().toggleItalic().run()}
                      className={cn(
                        "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                        statusEditor.isActive("italic") && "bg-gray-200 dark:bg-gray-700"
                      )}
                      type="button"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <button
                      onClick={() => statusEditor.chain().focus().toggleBulletList().run()}
                      className={cn(
                        "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                        statusEditor.isActive("bulletList") && "bg-gray-200 dark:bg-gray-700"
                      )}
                      type="button"
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => statusEditor.chain().focus().toggleOrderedList().run()}
                      className={cn(
                        "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                        statusEditor.isActive("orderedList") && "bg-gray-200 dark:bg-gray-700"
                      )}
                      type="button"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          type="button"
                          title="Insert Emoji"
                        >
                          <Smile className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 border-0" 
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                          if (e.target instanceof Element && e.target.closest('[role="dialog"]')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            statusEditor?.chain().focus().insertContent(emojiData.emoji).run();
                            setShowEmojiPicker(false);
                          }}
                          width={350}
                          height={400}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {/* Editor Content */}
                <EditorContent editor={statusEditor} className="bg-white dark:bg-gray-800" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusForm(false);
                  setStatusDescription("");
                  statusEditor?.commands.clearContent();
                }}
                data-testid="button-cancel-status"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusSubmit}
                disabled={!user?.id || createStatusMutation.isPending}
                data-testid="button-create-status"
              >
                {createStatusMutation.isPending ? "Creating..." : "Create new status"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {latestStatus ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5", getStatusColor(latestStatus.status))} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">{getStatusLabel(latestStatus.status)}</span>
                      {(latestStatus as any).userName && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {(latestStatus as any).userName}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500">
                        {latestStatus.createdAt ? new Date(latestStatus.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {latestStatus.description && (
                      <div 
                        className="text-sm text-gray-600 dark:text-gray-400 mt-1 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: latestStatus.description }}
                      />
                    )}
                  </div>
                </div>
                
                {statusUpdates && statusUpdates.length > 1 && (
                  <button
                    onClick={() => setShowStatusHistory(!showStatusHistory)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    data-testid="button-toggle-history"
                  >
                    {showStatusHistory ? 'Hide history' : 'Show history'}
                  </button>
                )}

                {showStatusHistory && statusUpdates && statusUpdates.length > 1 && (
                  <div className="space-y-2 mt-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                    {statusUpdates.slice(1).map((status) => (
                      <div key={status.id} className="flex items-start gap-3 p-2">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5", getStatusColor(status.status))} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusLabel(status.status)}</span>
                            {(status as any).userName && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {(status as any).userName}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-gray-500">
                              {status.createdAt ? new Date(status.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          {status.description && (
                            <div 
                              className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: status.description }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No status updates yet</p>
            )}
          </>
        )}
      </div>

      {/* Project Completion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-6">Project completion</h3>
        <div className="flex items-start gap-12">
          {/* Circular Progress */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${44 * 3.14} ${100 * 3.14}`}
                strokeLinecap="round"
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">44%</span>
            </div>
          </div>
          
          {/* Action completion list */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Action completion</h4>
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Overdue</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Incomplete</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">9</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Complete</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Team workload</h3>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex">
          {/* Main content area */}
          <div className="flex-1">
            {/* Header */}
            <div className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignee</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Work distribution</div>
            </div>
            
            {/* Scrollable content */}
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { name: "Alice Johnson", initials: "AJ", percentage: 85 },
                { name: "Bob Smith", initials: "BS", percentage: 60 },
                { name: "Carol Davis", initials: "CD", percentage: 40 },
                { name: "David Wilson", initials: "DW", percentage: 20 },
                { name: "Emma Taylor", initials: "ET", percentage: 75 },
                { name: "Frank Miller", initials: "FM", percentage: 50 },
                { name: "Grace Lee", initials: "GL", percentage: 30 },
                { name: "Henry Brown", initials: "HB", percentage: 90 },
              ].map((member, index) => {
                // Color based on percentage: low (green) to high (red)
                const getColorClass = (pct: number) => {
                  if (pct <= 30) return "bg-green-500";
                  if (pct <= 50) return "bg-yellow-500";
                  if (pct <= 70) return "bg-orange-500";
                  return "bg-red-500";
                };
                
                const colorClass = getColorClass(member.percentage);
                
                return (
                  <div 
                    key={index} 
                    className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50" 
                    data-testid={`team-workload-${index}`}
                  >
                    {/* Assignee column */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-semibold text-white">
                          {member.initials}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{member.name}</span>
                    </div>
                    
                    {/* Work distribution bar */}
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-7 overflow-hidden relative">
                        <div
                          className={`h-full ${colorClass} transition-all`}
                          style={{ width: `${member.percentage}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {member.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="w-6 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center justify-between py-2">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" style={{ height: '60%' }}>
                <div className="w-full h-1/3 bg-gray-500 dark:bg-gray-500 rounded-full"></div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Project Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ProjectActivityFeed projectId={projectId} />
      </div>

      {/* Project Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project description</h3>
        {!isEditingDescription ? (
          <div>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 mb-4"
              dangerouslySetInnerHTML={{ __html: project.description || "<p>No description yet</p>" }}
            />
            <Button variant="outline" onClick={() => setIsEditingDescription(true)} data-testid="button-edit-description">
              Edit description
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              {/* Formatting Toolbar */}
              {descriptionEditor && (
                <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => descriptionEditor.chain().focus().toggleBold().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                      descriptionEditor.isActive("bold") && "bg-gray-200 dark:bg-gray-700"
                    )}
                    type="button"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => descriptionEditor.chain().focus().toggleItalic().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                      descriptionEditor.isActive("italic") && "bg-gray-200 dark:bg-gray-700"
                    )}
                    type="button"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    onClick={() => descriptionEditor.chain().focus().toggleBulletList().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                      descriptionEditor.isActive("bulletList") && "bg-gray-200 dark:bg-gray-700"
                    )}
                    type="button"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => descriptionEditor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                      descriptionEditor.isActive("orderedList") && "bg-gray-200 dark:bg-gray-700"
                    )}
                    type="button"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <Popover open={showDescriptionEmojiPicker} onOpenChange={setShowDescriptionEmojiPicker}>
                    <PopoverTrigger asChild>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        type="button"
                        title="Insert Emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 border-0" 
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        if (e.target instanceof Element && e.target.closest('[role="dialog"]')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData: EmojiClickData) => {
                          descriptionEditor?.chain().focus().insertContent(emojiData.emoji).run();
                          setShowDescriptionEmojiPicker(false);
                        }}
                        width={350}
                        height={400}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              {/* Editor Content */}
              <EditorContent editor={descriptionEditor} className="bg-white dark:bg-gray-800" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditingDescription(false);
                descriptionEditor?.commands.setContent(project.description || "");
                setDescription(project.description || "");
              }} data-testid="button-cancel-description">
                Cancel
              </Button>
              <Button onClick={handleDescriptionSave} data-testid="button-save-description">
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attachments</h3>
        
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileName);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                data-testid={`attachment-${attachment.id}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100 dark:bg-blue-900">
                  <FileIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.fileName}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-attachment-menu-${attachment.id}`}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                      data-testid={`button-open-file-${attachment.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open file
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyLink(attachment.fileUrl)}
                      data-testid={`button-copy-link-${attachment.id}`}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = attachment.fileUrl;
                        link.download = attachment.fileName;
                        link.click();
                      }}
                      data-testid={`button-download-${attachment.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                      className="text-red-600 dark:text-red-400"
                      data-testid={`button-remove-${attachment.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
          
          <ObjectUploader
            maxNumberOfFiles={10}
            maxFileSize={10485760}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonVariant="ghost"
            buttonClassName="text-blue-600 dark:text-blue-400 p-0 h-auto hover:bg-transparent justify-start"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add attachments
          </ObjectUploader>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <BudgetOverview projectId={projectId} />
      </div>
    </div>
  );
}
