import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Settings, Calendar as CalendarIcon, Clock, X, GripVertical, Trash2, Edit2 } from "lucide-react";
import { InlineTaskCreator } from "@/components/teams/inline-task-creator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@shared/schema";

interface Project {
  id: string;
  task: string;
  status: string;
  owner: string | null;
  dueDate: string | null;
  effortEstimate: number | null;
  risk: string | null;
  taskType: string | null;
}

interface KanbanColumn {
  id: string;
  name: string;
  icon: string;
}

interface ProjectKanbanTabProps {
  projectId: string;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "new-task", name: "New task", icon: "📋" },
  { id: "scheduled", name: "Scheduled", icon: "📅" },
  { id: "in-progress", name: "In Progress", icon: "🔄" },
  { id: "completed", name: "Completed", icon: "✅" },
];

// Kanban Card Component
function KanbanCard({ task, onDragStart }: { task: Project; onDragStart: () => void }) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK_CARD",
    item: { taskId: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (statusLower.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (statusLower.includes("scheduled")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const getRiskColor = (risk: string | null) => {
    if (!risk) return "";
    if (risk === "High") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  };

  return (
    <Card
      ref={drag}
      className={`cursor-move hover:shadow-md transition-shadow mb-2 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      data-testid={`kanban-card-${task.id}`}
    >
      <CardContent className="p-3 space-y-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.task}</h4>
        
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
            {task.status}
          </Badge>
          {task.risk && (
            <Badge variant="secondary" className={`text-xs ${getRiskColor(task.risk)}`}>
              {task.risk}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), "MMM d")}</span>
            </div>
          )}
          {task.effortEstimate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(task.effortEstimate / 60)}h</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Status Item for Edit Dialog
function SortableStatusItem({ column, onRename, onDelete }: {
  column: KanbanColumn;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (name.trim() && name !== column.name) {
      onRename(column.id, name.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
      data-testid={`status-item-${column.id}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <span className="text-lg">{column.icon}</span>
      
      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setName(column.name);
              setIsEditing(false);
            }
          }}
          className="flex-1 h-8"
          autoFocus
          data-testid={`input-rename-${column.id}`}
        />
      ) : (
        <span className="flex-1 font-medium">{column.name}</span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsEditing(true)}
          data-testid={`button-edit-${column.id}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          onClick={() => onDelete(column.id)}
          data-testid={`button-delete-${column.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({ column, tasks, teamMembers, onDrop, onCreateTask }: {
  column: KanbanColumn;
  tasks: Project[];
  teamMembers: TeamMember[];
  onDrop: (taskId: string, columnName: string) => void;
  onCreateTask: (data: any) => void;
}) {
  const [showCreator, setShowCreator] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: "TASK_CARD",
    drop: (item: { taskId: string }) => {
      onDrop(item.taskId, column.name);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex flex-col min-w-[280px] max-w-[320px] h-full ${
        isOver ? "bg-blue-50 dark:bg-blue-900/10" : ""
      } transition-colors rounded-lg`}
      data-testid={`kanban-column-${column.id}`}
    >
      <Card className="h-full flex flex-col shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{column.icon}</span>
              <h3 className="font-semibold text-sm">{column.name}</h3>
            </div>
            <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 overflow-y-auto">
          {showCreator && (
            <div className="mb-2">
              <InlineTaskCreator
                columnName={column.name}
                teamMembers={teamMembers}
                onSave={(taskData) => {
                  onCreateTask(taskData);
                  setShowCreator(false);
                }}
                onCancel={() => setShowCreator(false)}
              />
            </div>
          )}

          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onDragStart={() => {}} />
          ))}

          {tasks.length === 0 && !showCreator && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Drop cards here
            </div>
          )}

          {!showCreator && (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground mt-2"
              onClick={() => setShowCreator(true)}
              data-testid="button-add-task-inline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create task
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Kanban Tab Component
export function ProjectKanbanTab({ projectId }: ProjectKanbanTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Fetch team members
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Fetch project sections
  const { data: sections = [] } = useQuery<any[]>({
    queryKey: ["/api/project-sections", projectId],
  });

  // Fetch project tasks
  const { data: tasks = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects/${projectId}/tasks`],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      // Automatically set startDate for Gantt compatibility
      let startDate = data.startDate;
      if (!startDate) {
        if (data.dueDate) {
          // Set start date to 7 days before due date
          const dueDateTime = new Date(data.dueDate);
          const startDateTime = new Date(dueDateTime);
          startDateTime.setDate(startDateTime.getDate() - 7);
          startDate = format(startDateTime, 'yyyy-MM-dd');
        } else {
          // Set start date to today
          startDate = format(new Date(), 'yyyy-MM-dd');
        }
      }
      
      // Automatically assign to first section for Gantt compatibility
      let sectionId = data.sectionId;
      if (!sectionId && sections.length > 0) {
        sectionId = sections[0].id;
      }
      
      return await apiRequest("POST", `/api/projects/${projectId}/tasks`, {
        ...data,
        startDate,
        sectionId,
        department: "Product", // Default department
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      toast({
        title: "Task created",
        description: "New task has been added successfully.",
      });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
    },
  });

  const handleCardDrop = (taskId: string, columnName: string) => {
    updateTaskStatusMutation.mutate({ taskId, status: columnName });
  };

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRenameColumn = (id: string, newName: string) => {
    setColumns((cols) =>
      cols.map((col) => (col.id === id ? { ...col, name: newName } : col))
    );
    toast({
      title: "Status renamed",
      description: `Status has been renamed to "${newName}"`,
    });
  };

  const handleDeleteColumn = (id: string) => {
    setColumns((cols) => cols.filter((col) => col.id !== id));
    toast({
      title: "Status deleted",
      description: "Status has been removed",
    });
  };

  const handleAddColumn = () => {
    const newColumn: KanbanColumn = {
      id: `custom-${Date.now()}`,
      name: "New status",
      icon: "📌",
    };
    setColumns([...columns, newColumn]);
  };

  // Group tasks by column
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.name] = tasks.filter((task) => {
      if (column.name === "New task") return task.status === "Not Started";
      if (column.name === "Completed") return task.status === "Completed";
      return task.status === column.name;
    });
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-220px)] flex flex-col" data-testid="project-kanban-board">
        {/* Board Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs">
                <span className="text-sm">{column.icon}</span>
                <span className="font-medium">{column.name}</span>
                <span className="text-gray-500">{tasksByColumn[column.name]?.length || 0}</span>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStatusManager(true)}
            className="h-8 w-8 p-0"
            data-testid="button-manage-statuses"
          >
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Kanban Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-4 p-4 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.name] || []}
                teamMembers={teamMembers}
                onDrop={handleCardDrop}
                onCreateTask={handleCreateTask}
              />
            ))}
          </div>
        </div>

        {/* Status Manager Dialog */}
        <Dialog open={showStatusManager} onOpenChange={setShowStatusManager}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit statuses</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columns.map((column) => (
                    <SortableStatusItem
                      key={column.id}
                      column={column}
                      onRename={handleRenameColumn}
                      onDelete={handleDeleteColumn}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={handleAddColumn}
                data-testid="button-add-new-status"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add new status
              </Button>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setShowStatusManager(false)} data-testid="button-close-modal">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
