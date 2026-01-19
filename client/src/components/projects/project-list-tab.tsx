import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight, GripVertical, MoreHorizontal, ArrowUpDown, Filter, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, ProjectSection, TeamMember } from "@shared/schema";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProjectListTabProps {
  projectId: string;
}

interface ColumnWidths {
  name: number;
  assignees: number;
  status: number;
  dueDate: number;
}

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 400,
  assignees: 120,
  status: 150,
  dueDate: 120,
};

export function ProjectListTab({ projectId }: ProjectListTabProps) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<ProjectSection[]>({
    queryKey: ["/api/project-sections", projectId],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects?workspaceProjectId=${projectId}`],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Fetch all workspace users for assignee dropdown
  const { data: users = [] } = useQuery<{ id: string; displayName: string; email: string }[]>({
    queryKey: ["/api/users"],
  });

  const createSectionMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/project-sections", {
        projectId,
        name,
        order: sections.length,
      }) as unknown as ProjectSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-sections", projectId] });
      setNewSectionName("");
      setIsCreatingSection(false);
    },
  });

  const handleCreateSection = () => {
    if (newSectionName.trim()) {
      createSectionMutation.mutate(newSectionName.trim());
    }
  };

  const handleResizeColumn = (column: keyof ColumnWidths, delta: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: Math.max(80, prev[column] + delta),
    }));
  };

  if (sectionsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Table Header */}
      <div className="border-b table-border bg-muted/30 sticky top-0 z-10">
        <div className="flex items-center h-10 text-sm font-medium text-muted-foreground">
          <div 
            className="relative flex items-center gap-2 px-4 border-r table-border"
            style={{ width: columnWidths.name }}
          >
            <span>Name</span>
            <ArrowUpDown className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" data-testid="button-sort-name" />
            <ResizeHandle onResize={(delta) => handleResizeColumn('name', delta)} />
          </div>
          
          <div 
            className="relative flex items-center px-4 py-2.5 border-r table-border"
            style={{ width: columnWidths.assignees }}
          >
            <span>Assignees</span>
            <ResizeHandle onResize={(delta) => handleResizeColumn('assignees', delta)} />
          </div>
          
          <div 
            className="relative flex items-center gap-2 px-4 py-2.5 border-r table-border"
            style={{ width: columnWidths.status }}
          >
            <span>Status</span>
            <Filter className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" data-testid="button-filter-status" />
            <ResizeHandle onResize={(delta) => handleResizeColumn('status', delta)} />
          </div>
          
          <div 
            className="relative flex items-center px-4 py-2.5"
            style={{ width: columnWidths.dueDate }}
          >
            <span>Due date</span>
            <ResizeHandle onResize={(delta) => handleResizeColumn('dueDate', delta)} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {sections.length === 0 && !isCreatingSection ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-muted-foreground mb-4">No sections yet</div>
            <Button onClick={() => setIsCreatingSection(true)} data-testid="button-create-first-section">
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          </div>
        ) : (
          <div>
            <SectionsList
              sections={sections}
              tasks={tasks}
              projectId={projectId}
              teamMembers={teamMembers}
              users={users}
              columnWidths={columnWidths}
            />
            
            {/* Add Section Inline */}
            {isCreatingSection ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/30 border-b table-border">
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSection();
                    if (e.key === "Escape") {
                      setIsCreatingSection(false);
                      setNewSectionName("");
                    }
                  }}
                  placeholder="Section name..."
                  autoFocus
                  className="max-w-xs"
                  data-testid="input-new-section-name"
                />
                <Button onClick={handleCreateSection} size="sm" disabled={!newSectionName.trim()} data-testid="button-save-section">
                  Add
                </Button>
                <Button onClick={() => { setIsCreatingSection(false); setNewSectionName(""); }} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingSection(true)}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 flex items-center gap-2"
                data-testid="button-add-section"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ResizeHandleProps {
  onResize: (delta: number) => void;
}

function ResizeHandle({ onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors",
        isDragging && "bg-blue-500"
      )}
      onMouseDown={handleMouseDown}
    />
  );
}

interface SectionsListProps {
  sections: ProjectSection[];
  tasks: Project[];
  projectId: string;
  teamMembers: TeamMember[];
  users: { id: string; displayName: string; email: string }[];
  columnWidths: ColumnWidths;
}

function SectionsList({ sections, tasks, projectId, teamMembers, users, columnWidths }: SectionsListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [orderedSections, setOrderedSections] = useState(sections);

  useEffect(() => {
    setOrderedSections([...sections].sort((a, b) => a.order - b.order));
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
      const newIndex = orderedSections.findIndex((s) => s.id === over.id);

      const newOrder = arrayMove(orderedSections, oldIndex, newIndex);
      const previousOrder = orderedSections;
      setOrderedSections(newOrder);

      try {
        await Promise.all(
          newOrder.map((section, index) =>
            apiRequest("PATCH", `/api/project-sections/${section.id}`, { order: index })
          )
        );
      } catch (error) {
        console.error("Failed to reorder sections:", error);
        setOrderedSections(previousOrder);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div>
          {orderedSections.map((section) => {
            const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
            const isCollapsed = collapsedSections.has(section.id);

            return (
              <SectionRow
                key={section.id}
                section={section}
                tasks={sectionTasks}
                isCollapsed={isCollapsed}
                onToggle={() => toggleSection(section.id)}
                projectId={projectId}
                teamMembers={teamMembers}
                users={users}
                columnWidths={columnWidths}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SectionRowProps {
  section: ProjectSection;
  tasks: Project[];
  isCollapsed: boolean;
  onToggle: () => void;
  projectId: string;
  teamMembers: TeamMember[];
  users: { id: string; displayName: string; email: string }[];
  columnWidths: ColumnWidths;
}

function SectionRow({ section, tasks, isCollapsed, onToggle, projectId, teamMembers, users, columnWidths }: SectionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deleteSectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/project-sections/${section.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-sections", projectId] });
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete section "${section.name}"? Tasks will be moved to unsectioned.`)) {
      deleteSectionMutation.mutate();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-background">
      {/* Section Header */}
      <div className="flex items-center border-b table-border hover:bg-accent/30 group bg-muted/20">
        <div className="relative flex items-center gap-2 px-4 py-2.5 border-r table-border" style={{ width: columnWidths.name }}>
          <button
            onClick={onToggle}
            className="p-0.5 hover:bg-accent rounded"
            data-testid={`button-toggle-section-${section.id}`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <span className="font-semibold text-sm" data-testid={`text-section-name-${section.id}`}>
            {section.name}
          </span>

          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              data-testid={`button-edit-section-${section.id}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              data-testid={`button-delete-section-${section.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Badge variant="secondary" className="text-xs ml-2" data-testid={`text-section-count-${section.id}`}>
            {tasks.length}
          </Badge>
        </div>
        
        <div className="relative border-r table-border" style={{ width: columnWidths.assignees }}></div>
        <div className="relative border-r table-border" style={{ width: columnWidths.status }}></div>
        <div className="relative" style={{ width: columnWidths.dueDate }}></div>
      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} teamMembers={teamMembers} columnWidths={columnWidths} />
          ))}
          
          <InlineTaskCreator sectionId={section.id} projectId={projectId} teamMembers={teamMembers} users={users} columnWidths={columnWidths} />
        </div>
      )}
    </div>
  );
}

interface InlineTaskCreatorProps {
  sectionId: string;
  projectId: string;
  teamMembers: TeamMember[];
  users: { id: string; displayName: string; email: string }[];
  columnWidths: ColumnWidths;
}

function InlineTaskCreator({ sectionId, projectId, teamMembers, users, columnWidths }: InlineTaskCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [status, setStatus] = useState("Not Started");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/projects", {
        task: taskName,
        department: "Product",
        workspaceProjectId: projectId,
        sectionId,
        owner: assignee || null,
        status,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      }) as unknown as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
      setTaskName("");
      setAssignee("");
      setStatus("Not Started");
      setDueDate(undefined);
      setIsCreating(false);
    },
  });

  const handleSave = () => {
    if (!taskName.trim()) return;
    createTaskMutation.mutate();
  };

  if (!isCreating) {
    return (
      <div className="flex items-center border-b table-border hover:bg-accent/50 transition-colors">
        <button
          onClick={() => setIsCreating(true)}
          className="relative text-left pl-16 pr-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2 border-r table-border"
          style={{ width: columnWidths.name }}
          data-testid={`button-create-task-${sectionId}`}
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add task</span>
        </button>
        <div className="relative border-r table-border" style={{ width: columnWidths.assignees }}></div>
        <div className="relative border-r table-border" style={{ width: columnWidths.status }}></div>
        <div className="relative" style={{ width: columnWidths.dueDate }}></div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b table-border bg-accent/20" data-testid={`inline-creator-${sectionId}`}>
      <div className="relative pl-16 pr-4 py-3 border-r table-border" style={{ width: columnWidths.name }}>
        <Input
          placeholder="Task name..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && taskName.trim()) handleSave();
            if (e.key === "Escape") setIsCreating(false);
          }}
          autoFocus
          className="h-9 border focus-visible:ring-1 focus-visible:ring-blue-500 bg-background"
          data-testid={`input-task-name-${sectionId}`}
        />
      </div>

      <div className="relative px-4 border-r table-border" style={{ width: columnWidths.assignees }}>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="h-9 border bg-background focus:ring-1 focus:ring-blue-500" data-testid={`select-assignee-${sectionId}`}>
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.displayName}>
                {user.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative px-4 border-r table-border" style={{ width: columnWidths.status }}>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 border bg-background focus:ring-1 focus:ring-blue-500" data-testid={`select-status-${sectionId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative px-4 flex items-center gap-2" style={{ width: columnWidths.dueDate }}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3" data-testid={`button-due-date-${sectionId}`}>
              {dueDate ? format(dueDate, "MMM d") : "Due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleSave} size="sm" className="h-9 bg-blue-600 hover:bg-blue-700" disabled={!taskName.trim()} data-testid={`button-save-task-${sectionId}`}>
          Save
        </Button>
        
        <Button onClick={() => setIsCreating(false)} variant="ghost" size="sm" className="h-9" data-testid={`button-cancel-task-${sectionId}`}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: Project;
  teamMembers: TeamMember[];
  columnWidths: ColumnWidths;
}

function TaskRow({ task, teamMembers, columnWidths }: TaskRowProps) {
  const owner = teamMembers.find((m) => m.name === task.owner);
  
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/projects/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${task.workspaceProjectId}`] });
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete task "${task.task}"?`)) {
      deleteTaskMutation.mutate();
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="flex items-center border-b border-r table-border hover:bg-accent/30 group" data-testid={`task-row-${task.id}`}>
      <div className="relative flex items-center gap-2 pl-16 pr-4 py-2.5 border-r table-border" style={{ width: columnWidths.name }}>
        <div className="opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm flex-1 min-w-0 truncate" data-testid={`text-task-name-${task.id}`}>
          {task.task}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            data-testid={`button-edit-task-${task.id}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            data-testid={`button-delete-task-${task.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative px-4 py-2.5 flex items-center border-r table-border" style={{ width: columnWidths.assignees }}>
        {owner && (
          <Avatar className="h-6 w-6">
            <AvatarFallback style={{ backgroundColor: owner.avatarColor || undefined }}>
              {owner.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="relative px-4 py-2.5 border-r table-border" style={{ width: columnWidths.status }}>
        <Badge variant="outline" className={cn("text-xs border-0", getStatusColor(task.status))} data-testid={`text-task-status-${task.id}`}>
          {task.status}
        </Badge>
      </div>

      <div className="relative px-4 py-2.5 flex items-center" style={{ width: columnWidths.dueDate }}>
        {task.dueDate && (
          <div className={cn("text-xs font-medium", isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} data-testid={`text-task-due-${task.id}`}>
            {format(new Date(task.dueDate), "MMM d")}
          </div>
        )}
      </div>
    </div>
  );
}
