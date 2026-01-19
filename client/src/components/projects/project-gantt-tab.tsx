import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, startOfYear, endOfYear, eachDayOfInterval, differenceInDays, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth, isSameDay, addWeeks, addMonths, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Check, Calendar as CalendarIcon, Trash2, Copy, ExternalLink } from "lucide-react";
import { useState, useMemo, useRef, useCallback, useEffect, createContext, useContext } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ResizableTableHead } from "@/components/ui/resizable-table";
import type { Project, ProjectSection, TeamMember } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ZoomLevel = "day" | "week" | "month";

interface TimelineContextType {
  zoom: ZoomLevel;
  setZoom: (zoom: ZoomLevel) => void;
  timelineDays: Date[];
  dayWidth: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimelineContext must be used within TimelineContext.Provider");
  }
  return context;
};

interface ProjectGanttTabProps {
  projectId: string;
}

const COLUMN_STORAGE_KEY = "gantt-column-widths";
const LABEL_COLORS: Record<string, string> = {
  "urgent": "#EF4444",
  "high-priority": "#F59E0B",
  "medium-priority": "#3B82F6",
  "low-priority": "#10B981",
  "bug": "#DC2626",
  "feature": "#8B5CF6",
  "enhancement": "#14B8A6",
};

export function ProjectGanttTab({ projectId }: ProjectGanttTabProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    taskName: 250,
    startDate: 120,
    endDate: 120,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects?workspaceProjectId=${projectId}`],
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<ProjectSection[]>({
    queryKey: ["/api/project-sections", projectId],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

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

  const dateRange = useMemo(() => {
    const year2025 = new Date(2025, 0, 1);
    return {
      start: startOfYear(year2025),
      end: endOfYear(year2025),
    };
  }, []);

  const timelineDays = useMemo(() => {
    if (zoom === "week") {
      return eachWeekOfInterval({ start: dateRange.start, end: dateRange.end }, { weekStartsOn: 1 });
    } else if (zoom === "month") {
      return eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    }
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange, zoom]);

  const dayWidth = zoom === "day" ? 32 : zoom === "week" ? 80 : 120;
  const timelineWidth = timelineDays.length * dayWidth;

  const handleColumnResize = useCallback((columnKey: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [columnKey]: width }));
  }, []);

  if (tasksLoading || sectionsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  const totalTableWidth = columnWidths.taskName + columnWidths.startDate + columnWidths.endDate + 50;

  return (
    <TimelineContext.Provider value={{ zoom, setZoom, timelineDays, dayWidth, scrollContainerRef }}>
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
          <span className="text-sm font-medium mr-2">View:</span>
          <Button
            size="sm"
            variant={zoom === "day" ? "default" : "outline"}
            onClick={() => setZoom("day")}
            data-testid="button-zoom-day"
          >
            Day
          </Button>
          <Button
            size="sm"
            variant={zoom === "week" ? "default" : "outline"}
            onClick={() => setZoom("week")}
            data-testid="button-zoom-week"
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={zoom === "month" ? "default" : "outline"}
            onClick={() => setZoom("month")}
            data-testid="button-zoom-month"
          >
            Month
          </Button>
        </div>

        {/* Header */}
        <div className="flex border-b sticky top-0 z-20 bg-background">
          <div className="flex-shrink-0 bg-background border-r" style={{ width: `${totalTableWidth}px` }}>
            <div className="flex h-14 items-center">
              <div style={{ width: "50px" }} className="px-2"></div>
              <ResizableTableHead
                columnKey="taskName"
                minWidth={150}
                defaultWidth={250}
                storageKey={COLUMN_STORAGE_KEY}
                onWidthChange={handleColumnResize}
                className="font-semibold text-sm px-4 border-r"
              >
                Task Name
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="startDate"
                minWidth={80}
                defaultWidth={120}
                storageKey={COLUMN_STORAGE_KEY}
                onWidthChange={handleColumnResize}
                className="font-semibold text-sm text-center border-r"
              >
                Start
              </ResizableTableHead>
              <ResizableTableHead
                columnKey="endDate"
                minWidth={80}
                defaultWidth={120}
                storageKey={COLUMN_STORAGE_KEY}
                onWidthChange={handleColumnResize}
                className="font-semibold text-sm text-center"
              >
                End
              </ResizableTableHead>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto" ref={scrollContainerRef} style={{ minWidth: 0 }}>
            <div className="h-14" style={{ width: `${timelineWidth}px` }}>
              <TimelineHeader />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="flex">
            <div className="flex-shrink-0 bg-background border-r" style={{ width: `${totalTableWidth}px` }}>
              {orderedSections.map((section) => {
                const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
                const isCollapsed = collapsedSections.has(section.id);

                return (
                  <GanttSection
                    key={section.id}
                    section={section}
                    tasks={sectionTasks}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleSection(section.id)}
                    teamMembers={teamMembers}
                    projectId={projectId}
                    columnWidths={columnWidths}
                  />
                );
              })}
            </div>

            <div 
              className="flex-1 overflow-x-auto" 
              style={{ minWidth: 0 }}
              onScroll={(e) => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
            >
              <div style={{ width: `${timelineWidth}px` }}>
                {orderedSections.map((section) => {
                  const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
                  const isCollapsed = collapsedSections.has(section.id);

                  return (
                    <GanttTimeline
                      key={section.id}
                      section={section}
                      tasks={sectionTasks}
                      isCollapsed={isCollapsed}
                      teamMembers={teamMembers}
                      projectId={projectId}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TimelineContext.Provider>
  );
}

function TimelineHeader() {
  const { timelineDays, dayWidth, zoom } = useTimelineContext();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthGroups = useMemo(() => {
    const groups: { month: string; startIndex: number; days: Date[] }[] = [];
    let currentMonth = '';
    let currentGroup: Date[] = [];
    let startIndex = 0;

    timelineDays.forEach((day, index) => {
      const monthStr = format(day, zoom === "month" ? "MMM yyyy" : "MMM");
      if (monthStr !== currentMonth) {
        if (currentGroup.length > 0) {
          groups.push({ month: currentMonth, startIndex, days: currentGroup });
        }
        currentMonth = monthStr;
        startIndex = index;
        currentGroup = [day];
      } else {
        currentGroup.push(day);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ month: currentMonth, startIndex, days: currentGroup });
    }

    return groups;
  }, [timelineDays, zoom]);

  const todayIndex = timelineDays.findIndex(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    return isSameDay(dayDate, today);
  });

  return (
    <div className="relative h-full">
      <div className="flex h-7 border-b">
        {monthGroups.map((group, idx) => (
          <div
            key={idx}
            className="border-r border-l-2 border-l-primary px-2 flex items-center font-semibold text-xs bg-primary/5"
            style={{ width: `${group.days.length * dayWidth}px` }}
          >
            {group.month}
          </div>
        ))}
      </div>

      <div className="flex h-7 relative">
        {timelineDays.map((day, index) => {
          const isFirstOfMonth = day.getDate() === 1 || (zoom === "week" && index === 0) || (zoom === "month" && index === 0);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isEvenColumn = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 border-l text-center text-[11px] flex items-center justify-center relative",
                isFirstOfMonth && "border-l-2 border-l-primary font-semibold",
                isWeekend && zoom === "day" && "bg-muted/30",
                !isWeekend && isEvenColumn && "bg-gray-50 dark:bg-gray-900/20"
              )}
              style={{ width: `${dayWidth}px` }}
            >
              {zoom === "day" ? format(day, "dd") : zoom === "week" ? format(day, "dd") : format(day, "MMM")}
            </div>
          );
        })}
        
        {todayIndex >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${todayIndex * dayWidth + dayWidth / 2}px` }}
            data-testid="today-line"
          />
        )}
      </div>
    </div>
  );
}

interface GanttSectionProps {
  section: ProjectSection;
  tasks: Project[];
  isCollapsed: boolean;
  onToggle: () => void;
  teamMembers: TeamMember[];
  projectId: string;
  columnWidths: Record<string, number>;
}

function GanttSection({ section, tasks, isCollapsed, onToggle, teamMembers, projectId, columnWidths }: GanttSectionProps) {
  const { toast } = useToast();
  
  const createTaskMutation = useMutation({
    mutationFn: async (data: { task: string; sectionId: string; workspaceProjectId: string }) => {
      return await apiRequest("POST", `/api/projects`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
      toast({ title: "Task created successfully" });
    },
  });

  const handleAddTask = () => {
    createTaskMutation.mutate({
      task: "New Task",
      sectionId: section.id,
      workspaceProjectId: projectId,
    });
  };

  return (
    <div className="border-b">
      <div className="flex items-center h-11 bg-muted/40 hover:bg-muted/60 group transition-colors">
        <div style={{ width: "50px" }} className="px-2">
          <button 
            onClick={onToggle} 
            className="p-0.5 hover:bg-accent rounded transition-colors" 
            data-testid={`button-toggle-gantt-section-${section.id}`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        <div style={{ width: `${columnWidths.taskName}px` }} className="px-4 font-semibold text-sm flex items-center justify-between border-r">
          <div className="flex items-center gap-2">
            <span data-testid={`text-gantt-section-${section.id}`}>{section.name}</span>
            <span className="text-xs text-muted-foreground">({tasks.length})</span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleAddTask}
            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid={`button-add-task-${section.id}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div style={{ width: `${columnWidths.startDate}px` }} className="border-r" />
        <div style={{ width: `${columnWidths.endDate}px` }} />
      </div>

      {!isCollapsed && tasks.map((task) => (
        <TaskRow 
          key={task.id} 
          task={task} 
          teamMembers={teamMembers} 
          projectId={projectId}
          columnWidths={columnWidths}
        />
      ))}
    </div>
  );
}

interface TaskRowProps {
  task: Project;
  teamMembers: TeamMember[];
  projectId: string;
  columnWidths: Record<string, number>;
}

function TaskRow({ task, teamMembers, projectId, columnWidths }: TaskRowProps) {
  const owner = teamMembers.find((m) => m.name === task.owner);
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task.task);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      return await apiRequest("PATCH", `/api/projects/${task.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/projects/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
      toast({ title: "Task deleted" });
    },
  });

  const duplicateTaskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects`, {
        ...task,
        id: undefined,
        task: `${task.task} (Copy)`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
      toast({ title: "Task duplicated" });
    },
  });

  const handleToggleComplete = () => {
    const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
    updateTaskMutation.mutate({ status: newStatus });
  };

  const handleNameChange = () => {
    if (taskName !== task.task) {
      updateTaskMutation.mutate({ task: taskName });
    }
    setIsEditingName(false);
  };

  const handleDateChange = (field: "startDate" | "dueDate", date: Date | undefined) => {
    if (date) {
      updateTaskMutation.mutate({ [field]: format(date, "yyyy-MM-dd") });
    }
  };

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || isEditingName) return;
      
      if (e.key === " ") {
        e.preventDefault();
        handleToggleComplete();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this task?")) {
          deleteTaskMutation.mutate();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        setIsEditingName(true);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const allRows = document.querySelectorAll('[data-testid^="gantt-task-row-"]');
        const currentIndex = Array.from(allRows).findIndex(row => row === rowRef.current);
        
        if (currentIndex !== -1) {
          const nextIndex = e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
          const nextRow = allRows[nextIndex] as HTMLElement;
          if (nextRow) {
            nextRow.focus();
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        rowRef.current?.blur();
      }
    };

    if (isFocused) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isFocused, isEditingName, handleToggleComplete, deleteTaskMutation]);

  const isCompleted = task.status === "Completed";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          ref={rowRef}
          tabIndex={0}
          className={cn(
            "flex items-center h-12 border-b hover:bg-accent/20 transition-colors group outline-none",
            isFocused && "ring-2 ring-primary ring-inset"
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-testid={`gantt-task-row-${task.id}`}
        >
          <div style={{ width: "50px" }} className="px-2 flex items-center justify-center">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              data-testid={`checkbox-complete-${task.id}`}
            />
          </div>
          
          <div 
            style={{ width: `${columnWidths.taskName}px` }} 
            className="flex items-center gap-2 px-4 min-w-0 border-r"
          >
            {owner && (
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback style={{ backgroundColor: owner.avatarColor || undefined }} className="text-[10px]">
                  {owner.initials}
                </AvatarFallback>
              </Avatar>
            )}
            {isEditingName ? (
              <Input
                ref={inputRef}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameChange();
                  if (e.key === "Escape") {
                    setTaskName(task.task);
                    setIsEditingName(false);
                  }
                }}
                className="h-7 text-sm flex-1"
                data-testid={`input-task-name-${task.id}`}
              />
            ) : (
              <span 
                className={cn(
                  "text-sm truncate flex-1 cursor-pointer",
                  isCompleted && "line-through opacity-60"
                )}
                onClick={() => setIsEditingName(true)}
                data-testid={`text-gantt-task-${task.id}`}
              >
                {task.task}
              </span>
            )}
          </div>
          
          <div style={{ width: `${columnWidths.startDate}px` }} className="px-2 border-r">
            <DatePickerCell
              value={task.startDate}
              onChange={(date) => handleDateChange("startDate", date)}
              testId={`date-start-${task.id}`}
            />
          </div>
          
          <div style={{ width: `${columnWidths.endDate}px` }} className="px-2">
            {task.startDate && !task.dueDate ? (
              <Badge variant="outline" className="text-xs">No end date</Badge>
            ) : !task.startDate && !task.dueDate ? (
              <Badge variant="outline" className="text-xs">No dates</Badge>
            ) : (
              <DatePickerCell
                value={task.dueDate}
                onChange={(date) => handleDateChange("dueDate", date)}
                testId={`date-end-${task.id}`}
              />
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setIsEditingName(true)} data-testid={`menu-open-${task.id}`}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => duplicateTaskMutation.mutate()} data-testid={`menu-duplicate-${task.id}`}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => {
            if (confirm("Are you sure you want to delete this task?")) {
              deleteTaskMutation.mutate();
            }
          }}
          className="text-destructive"
          data-testid={`menu-delete-${task.id}`}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface DatePickerCellProps {
  value: string | null | undefined;
  onChange: (date: Date | undefined) => void;
  testId?: string;
}

function DatePickerCell({ value, onChange, testId }: DatePickerCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-7 px-2 text-xs justify-start font-normal w-full",
            !date && "text-muted-foreground"
          )}
          data-testid={testId}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {date ? format(date, "MMM dd") : "Set date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onChange(newDate);
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface GanttTimelineProps {
  section: ProjectSection;
  tasks: Project[];
  isCollapsed: boolean;
  teamMembers: TeamMember[];
  projectId: string;
}

function GanttTimeline({ section, tasks, isCollapsed, teamMembers, projectId }: GanttTimelineProps) {
  const { timelineDays, dayWidth, zoom } = useTimelineContext();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; index: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createTaskMutation = useMutation({
    mutationFn: async (data: { task: string; sectionId: string; workspaceProjectId: string; startDate: string; dueDate: string }) => {
      return await apiRequest("POST", `/api/projects`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
      toast({ title: "Task created successfully" });
    },
  });

  const handleTimelineMouseDown = (e: React.MouseEvent, index: number) => {
    if ((e.target as HTMLElement).closest('[data-testid^="gantt-bar-"]')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX, index });
    setDragEnd(index);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent, index: number) => {
    if (isDragging && dragStart) {
      setDragEnd(index);
    }
  };

  const handleTimelineMouseUp = () => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startIndex = Math.min(dragStart.index, dragEnd);
      const endIndex = Math.max(dragStart.index, dragEnd);
      
      const startDate = new Date(timelineDays[startIndex]);
      const endDate = new Date(timelineDays[endIndex]);
      
      createTaskMutation.mutate({
        task: "New Task",
        sectionId: section.id,
        workspaceProjectId: projectId,
        startDate: format(startDate, "yyyy-MM-dd"),
        dueDate: format(endDate, "yyyy-MM-dd"),
      });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleTimelineMouseUp();
      }
    };
    
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const getTaskPosition = (task: Project) => {
    if (!task.startDate || !task.dueDate) return null;

    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(task.dueDate);
    endDate.setHours(23, 59, 59, 999);
    
    let startIndex = -1;
    for (let i = 0; i < timelineDays.length; i++) {
      const timelineDay = new Date(timelineDays[i]);
      timelineDay.setHours(0, 0, 0, 0);
      if (timelineDay.getTime() >= startDate.getTime()) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) return null;

    const duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    const durationInUnits = zoom === "day" ? duration : zoom === "week" ? Math.ceil(duration / 7) : Math.ceil(duration / 30);
    const left = startIndex * dayWidth;
    const width = Math.max(durationInUnits * dayWidth - 4, zoom === "month" ? 60 : 40);

    return { left, width };
  };

  const todayIndex = timelineDays.findIndex(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    return isSameDay(dayDate, today);
  });

  const dragPreviewPosition = useMemo(() => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startIndex = Math.min(dragStart.index, dragEnd);
      const endIndex = Math.max(dragStart.index, dragEnd);
      const left = startIndex * dayWidth;
      const width = (endIndex - startIndex + 1) * dayWidth;
      return { left, width };
    }
    return null;
  }, [isDragging, dragStart, dragEnd, dayWidth]);

  return (
    <div className="border-b">
      <div className="h-11 border-b relative bg-muted/20">
        {timelineDays.map((day, index) => {
          const isFirstOfMonth = day.getDate() === 1;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isEvenColumn = index % 2 === 0;
          return (
            <div
              key={index}
              className={cn(
                "absolute top-0 bottom-0 border-l",
                isFirstOfMonth && "border-l-2 border-l-primary",
                isWeekend && zoom === "day" && "bg-muted/30",
                !isWeekend && isEvenColumn && "bg-gray-50 dark:bg-gray-900/20"
              )}
              style={{ left: `${index * dayWidth}px`, width: `${dayWidth}px` }}
            />
          );
        })}
        {todayIndex >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${todayIndex * dayWidth + dayWidth / 2}px` }}
          />
        )}
      </div>

      {!isCollapsed && (
        <>
          {tasks.map((task) => (
            <TaskBar
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              projectId={projectId}
              getTaskPosition={getTaskPosition}
            />
          ))}
          
          {/* Empty row for drag-to-create */}
          {tasks.length === 0 && (
            <div className="h-12 border-b relative flex items-center justify-center text-sm text-muted-foreground">
              <div className="absolute inset-0">
                {timelineDays.map((day, index) => {
                  const isFirstOfMonth = day.getDate() === 1;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isEvenColumn = index % 2 === 0;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "absolute top-0 bottom-0 border-l cursor-crosshair",
                        isFirstOfMonth && "border-l-2 border-l-primary",
                        isWeekend && zoom === "day" && "bg-muted/30",
                        !isWeekend && isEvenColumn && "bg-gray-50 dark:bg-gray-900/20"
                      )}
                      style={{ left: `${index * dayWidth}px`, width: `${dayWidth}px` }}
                      onMouseDown={(e) => handleTimelineMouseDown(e, index)}
                      onMouseMove={(e) => handleTimelineMouseMove(e, index)}
                    />
                  );
                })}
              </div>
              {!isDragging && <span className="relative z-10">Drag on the grid to create a task</span>}
              {dragPreviewPosition && (
                <div
                  className="absolute top-2.5 bottom-2.5 bg-blue-400/50 border-2 border-blue-500 border-dashed rounded z-20"
                  style={{ left: `${dragPreviewPosition.left + 2}px`, width: `${dragPreviewPosition.width - 4}px` }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface TaskBarProps {
  task: Project;
  teamMembers: TeamMember[];
  projectId: string;
  getTaskPosition: (task: Project) => { left: number; width: number } | null;
}

function TaskBar({ task, teamMembers, projectId, getTaskPosition }: TaskBarProps) {
  const { timelineDays, dayWidth, zoom } = useTimelineContext();
  const position = getTaskPosition(task);
  const owner = teamMembers.find((m) => m.name === task.owner);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, left: 0, width: 0 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      return await apiRequest("PATCH", `/api/projects/${task.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects?workspaceProjectId=${projectId}`] });
    },
  });

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize-left" | "resize-right") => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!position) return;

    if (type === "drag") {
      setIsDragging(true);
      setDragStart({ x: e.clientX, left: position.left, width: position.width });
    } else if (type === "resize-left") {
      setIsResizing("left");
      setDragStart({ x: e.clientX, left: position.left, width: position.width });
    } else if (type === "resize-right") {
      setIsResizing("right");
      setDragStart({ x: e.clientX, left: position.left, width: position.width });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!task.startDate || !task.dueDate) return;

      const deltaX = e.clientX - dragStart.x;

      if (isDragging) {
        const newLeft = dragStart.left + deltaX;
        const newStartIndex = Math.round(newLeft / dayWidth);
        
        if (newStartIndex >= 0 && newStartIndex < timelineDays.length) {
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.dueDate);
          const duration = differenceInDays(endDate, startDate);
          
          const newStartDate = new Date(timelineDays[newStartIndex]);
          const newEndDate = addDays(newStartDate, duration);
          
          updateTaskMutation.mutate({
            startDate: format(newStartDate, "yyyy-MM-dd"),
            dueDate: format(newEndDate, "yyyy-MM-dd"),
          });
        }
      } else if (isResizing === "left") {
        const newLeft = dragStart.left + deltaX;
        const newStartIndex = Math.round(newLeft / dayWidth);
        
        if (newStartIndex >= 0 && newStartIndex < timelineDays.length) {
          const newStartDate = new Date(timelineDays[newStartIndex]);
          const endDate = new Date(task.dueDate);
          
          if (newStartDate < endDate) {
            updateTaskMutation.mutate({
              startDate: format(newStartDate, "yyyy-MM-dd"),
            });
          }
        }
      } else if (isResizing === "right") {
        const newWidth = dragStart.width + deltaX;
        const durationInDays = Math.max(1, Math.round(newWidth / dayWidth));
        const startDate = new Date(task.startDate);
        const newEndDate = addDays(startDate, durationInDays - 1);
        
        updateTaskMutation.mutate({
          dueDate: format(newEndDate, "yyyy-MM-dd"),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, dayWidth, task, timelineDays, updateTaskMutation]);

  const todayIndex = timelineDays.findIndex(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    return isSameDay(dayDate, today);
  });

  const barColor = getTaskBarColor(task);
  const isCompleted = task.status === "Completed";

  return (
    <div className="h-12 border-b relative" data-testid={`gantt-timeline-${task.id}`}>
      {timelineDays.map((day, index) => {
        const isFirstOfMonth = day.getDate() === 1;
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isEvenColumn = index % 2 === 0;
        return (
          <div
            key={index}
            className={cn(
              "absolute top-0 bottom-0 border-l",
              isFirstOfMonth && "border-l-2 border-l-primary",
              isWeekend && zoom === "day" && "bg-muted/30",
              !isWeekend && isEvenColumn && "bg-gray-50 dark:bg-gray-900/20"
            )}
            style={{ left: `${index * dayWidth}px`, width: `${dayWidth}px` }}
          />
        );
      })}

      {todayIndex >= 0 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${todayIndex * dayWidth + dayWidth / 2}px` }}
        />
      )}

      {position && (
        <div
          className={cn(
            "absolute top-2.5 bottom-2.5 rounded flex items-center px-2 gap-1.5 shadow-sm z-10 transition-all hover:shadow-md group cursor-move",
            isCompleted && "opacity-60",
            isDragging && "opacity-50 cursor-grabbing"
          )}
          style={{ 
            left: `${position.left + 2}px`, 
            width: `${position.width}px`,
            backgroundColor: barColor,
            border: `1px solid ${barColor}`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "drag")}
          data-testid={`gantt-bar-${task.id}`}
          data-status={task.status}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-white/30 rounded-l"
            onMouseDown={(e) => handleMouseDown(e, "resize-left")}
            data-testid={`resize-left-${task.id}`}
          />
          
          {owner && (
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarFallback style={{ backgroundColor: owner.avatarColor || undefined }} className="text-[10px]">
                {owner.initials}
              </AvatarFallback>
            </Avatar>
          )}
          
          {isCompleted && <Check className="h-3 w-3 text-white flex-shrink-0" data-testid={`checkmark-${task.id}`} />}
          
          <span className="text-xs font-medium truncate text-white flex-1">{task.task}</span>
          
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-white/30 rounded-r"
            onMouseDown={(e) => handleMouseDown(e, "resize-right")}
            data-testid={`resize-right-${task.id}`}
          />
        </div>
      )}
    </div>
  );
}

function getTaskBarColor(task: Project): string {
  if (task.labels && task.labels.length > 0) {
    const firstLabel = task.labels[0].toLowerCase();
    if (LABEL_COLORS[firstLabel]) {
      return LABEL_COLORS[firstLabel];
    }
  }

  if (task.status === "Completed") return "#10B981";
  if (task.status === "In Progress") return "#3B82F6";
  if (task.status === "Blocked") return "#DC2626";
  if (task.status === "Reviewing") return "#F59E0B";
  return "#6B7280";
}
