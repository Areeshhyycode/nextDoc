import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ResizableTableHead, useColumnWidths } from "@/components/ui/resizable-table";
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Edit2, 
  Trash2, 
  Download,
  Calendar
} from "lucide-react";
import { JiraStyleTaskModal } from "./jira-style-task-modal";
import { format } from "date-fns";
import { type Project, type InsertProject, type TeamMember, type KanbanColumn } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DependencyIndicator } from "@/components/dependency/dependency-indicator";
import { DependencyNotificationSystem, type DependencyNotification } from "@/components/dependency/dependency-notification";
import { KanbanBoard } from "@/components/teams/kanban-board";
import { ViewToggle } from "@/components/teams/view-toggle";
import { EditStatusesModal } from "@/components/teams/edit-statuses-modal";
import { getDepartmentContextId } from "@shared/context-helpers";
import { STATUS_COLORS, RISK_COLORS, STAGE_COLORS } from "@/constants/colors";
import { formatDisplayValue } from "@/lib/utils";

interface EnhancedDepartmentPageProps {
  department: string;
  title: string;
  description: string;
  color: string;
}

type SortField = 'task' | 'status' | 'owner' | 'stage' | 'dueDate' | 'createdAt' | 'risk' | 'completionPercentage';
type SortDirection = 'asc' | 'desc';

export function EnhancedDepartmentPage({ department, title, description, color }: EnhancedDepartmentPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('task');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentView, setCurrentView] = useState<'table' | 'kanban'>('table');
  const [isEditStatusesOpen, setIsEditStatusesOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get contextId for this department
  const contextId = getDepartmentContextId(department);

  // Column widths for resizable table
  const storageKey = `column-widths-${contextId}`;
  const { widths: columnWidths, updateWidth } = useColumnWidths(storageKey, {
    task: 350,
    status: 110,
    owner: 120,
    stage: 100,
    dueDate: 110,
    risk: 80,
    description: 200,
    actions: 90
  });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects', department],
    queryFn: async () => {
      const response = await fetch(`/api/projects?department=${encodeURIComponent(department)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest('POST', '/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      setIsModalOpen(false);
      toast({ description: "Task created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to create task" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      apiRequest('PATCH', `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      setEditingProject(undefined);
      setIsModalOpen(false);
      toast({ description: "Task updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to update task" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({ description: "Task deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to delete task" });
    }
  });

  // Kanban-related queries
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const { data: kanbanColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ['/api/teams', contextId, 'kanban-columns'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${encodeURIComponent(contextId)}/kanban-columns`);
      if (!response.ok) {
        throw new Error('Failed to fetch kanban columns');
      }
      return response.json();
    },
  });

  const { data: viewPreference } = useQuery({
    queryKey: ['/api/teams', contextId, 'view-preference'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${encodeURIComponent(contextId)}/view-preference`);
      if (!response.ok) {
        throw new Error('Failed to fetch view preference');
      }
      return response.json();
    },
  });

  // Set view when preference is loaded
  useEffect(() => {
    if (viewPreference?.viewType) {
      setCurrentView(viewPreference.viewType);
    }
  }, [viewPreference]);

  const updateViewPreferenceMutation = useMutation({
    mutationFn: (viewType: 'table' | 'kanban') => 
      apiRequest('POST', `/api/teams/${encodeURIComponent(contextId)}/view-preference`, { viewType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'view-preference'] });
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ projectId, columnName }: { projectId: string; columnName: string }) => {
      // Map column name to status and handle scheduled date
      const updateData: { status?: string; scheduledDate?: string | null } = {};
      
      switch (columnName) {
        case 'New task':
          updateData.status = 'Not Started';
          updateData.scheduledDate = null;
          break;
        case 'Scheduled':
          updateData.status = 'Not Started';
          updateData.scheduledDate = new Date().toISOString().split('T')[0]; // Set today's date
          break;
        case 'In Progress':
          updateData.status = 'In Progress';
          break;
        case 'Completed':
          updateData.status = 'Completed';
          break;
        default:
          // For custom columns, just update status
          updateData.status = 'In Progress';
      }
      
      return apiRequest('PATCH', `/api/projects/${projectId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      toast({ description: "Task moved successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to move task" });
    },
  });

  const createKanbanTaskMutation = useMutation({
    mutationFn: (taskData: {
      task: string;
      dueDate: string | null;
      owner: string | null;
      effortEstimate: number | null;
      taskType: string | null;
      status: string;
    }) => {
      const mappedStatus = taskData.status === 'New task' ? 'Not Started' : taskData.status;
      return apiRequest('POST', '/api/projects', {
        ...taskData,
        department,
        status: mappedStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({ description: "Task created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to create task" });
    },
  });

  const renameKanbanColumnMutation = useMutation({
    mutationFn: ({ columnId, newName }: { columnId: string; newName: string }) => 
      apiRequest('PATCH', `/api/teams/${contextId}/kanban-columns/${columnId}`, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column renamed successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to rename column" });
    },
  });

  const deleteKanbanColumnMutation = useMutation({
    mutationFn: (columnId: string) => 
      apiRequest('DELETE', `/api/teams/${contextId}/kanban-columns/${columnId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to delete column" });
    },
  });

  const addKanbanColumnMutation = useMutation({
    mutationFn: ({ name, icon, color }: { name: string; icon: string; color: string }) => 
      apiRequest('POST', `/api/teams/${contextId}/kanban-columns`, {
        teamId: contextId,
        name,
        icon,
        color,
        order: kanbanColumns.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', contextId, 'kanban-columns'] });
      toast({ description: "Column added successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Failed to add column" });
    },
  });

  // Get unique values for filters
  const uniqueOwners = useMemo(() => 
    Array.from(new Set(projects.map(p => p.owner).filter(Boolean))), [projects]
  );

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = searchQuery === "" || 
        project.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.notes && project.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || project.risk === riskFilter;
      const matchesOwner = ownerFilter === 'all' || project.owner === ownerFilter;
      const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
      
      // Date range filtering logic
      const matchesDateRange = !dateRange?.from || (
        project.dueDate && 
        new Date(project.dueDate) >= dateRange.from && 
        (!dateRange.to || new Date(project.dueDate) <= dateRange.to)
      );

      return matchesSearch && matchesStatus && matchesRisk && matchesOwner && matchesStage && matchesDateRange;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dueDate' || sortField === 'createdAt') {
        aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
        bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, sortField, sortDirection, statusFilter, riskFilter, ownerFilter, stageFilter, dateRange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.task}"?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCreateTask = (data: InsertProject) => {
    createMutation.mutate({ ...data, department: department as any });
  };

  const handleUpdateTask = (data: Partial<Project>) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Task', 'Status', 'Owner', 'Stage', 'Due Date', 'Initiate Date', 'Risk', 'Description', 'Notes'],
      ...filteredAndSortedProjects.map(project => [
        project.task,
        formatDisplayValue(project.status),
        project.owner || '',
        formatDisplayValue(project.stage || ''),
        project.dueDate || '',
        project.createdAt ? format(new Date(project.createdAt), 'MMM dd, yyyy') : '',
        formatDisplayValue(project.risk || 'none'),
        (project as any).description || '',
        project.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${department}_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewChange = (view: 'table' | 'kanban') => {
    setCurrentView(view);
    updateViewPreferenceMutation.mutate(view);
  };

  const handleCardMove = (projectId: string, columnName: string) => {
    moveCardMutation.mutate({ projectId, columnName });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* Search */}
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks and notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-tasks"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]" data-testid="filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Reviewing">Reviewing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Design Approval Needed">Design Approval</SelectItem>
                  <SelectItem value="Temporary Hold">Temporary Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[120px]" data-testid="filter-risk">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="w-[120px]" data-testid="filter-owner">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {uniqueOwners.map(owner => (
                    <SelectItem key={owner} value={owner || ''}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
                className="w-[280px]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <ViewToggle 
              currentView={currentView}
              onViewChange={handleViewChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              data-testid="export-tasks"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingProject(undefined);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="add-task"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Table or Kanban */}
      {currentView === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <TableRow>
                <ResizableTableHead 
                  columnKey="task"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.task}
                  minWidth={150}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('task')}
                  data-testid="sort-task"
                >
                  <div className="flex items-center gap-2">
                    Task
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="status"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.status}
                  minWidth={80}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                  data-testid="sort-status"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="owner"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.owner}
                  minWidth={80}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden lg:table-cell"
                  onClick={() => handleSort('owner')}
                  data-testid="sort-owner"
                >
                  <div className="flex items-center gap-2">
                    Owner
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="stage"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.stage}
                  minWidth={80}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden xl:table-cell"
                  onClick={() => handleSort('stage')}
                  data-testid="sort-stage"
                >
                  <div className="flex items-center gap-2">
                    Stage
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="dueDate"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.dueDate}
                  minWidth={90}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden xl:table-cell"
                  onClick={() => handleSort('dueDate')}
                  data-testid="sort-due-date"
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="risk"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.risk}
                  minWidth={70}
                  onWidthChange={updateWidth}
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 hidden lg:table-cell"
                  onClick={() => handleSort('risk')}
                  data-testid="sort-risk"
                >
                  <div className="flex items-center gap-2">
                    Risk
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="description"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.description}
                  minWidth={100}
                  onWidthChange={updateWidth}
                  className="hidden md:table-cell"
                >
                  Description
                </ResizableTableHead>
                <ResizableTableHead 
                  columnKey="actions"
                  storageKey={storageKey}
                  defaultWidth={columnWidths.actions}
                  minWidth={80}
                  onWidthChange={updateWidth}
                >
                  Actions
                </ResizableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' || riskFilter !== 'all' || ownerFilter !== 'all' || dateRange?.from
                      ? "No tasks match your current filters." 
                      : "No tasks yet. Click 'Add New Task' to get started."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProjects.map((project, index) => (
                  <TableRow 
                    key={project.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
                    }`}
                    data-testid={`task-row-${project.id}`}
                  >
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-2" title={project.task}>
                          {project.task}
                        </div>
                        {/* Mobile-only details */}
                        <div className="flex flex-wrap gap-2 lg:hidden">
                          {project.owner && (
                            <Badge variant="outline" className="text-xs">
                              👤 {project.owner}
                            </Badge>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${RISK_COLORS[(project.risk || 'none') as keyof typeof riskColors]}`}
                          >
                            {project.risk || 'No Risk'}
                          </Badge>
                          {project.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              📅 {format(new Date(project.dueDate), 'MMM dd')}
                            </Badge>
                          )}
                        </div>
                        {/* Additional mobile info */}
                        <div className="xl:hidden">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${STAGE_COLORS[project.stage as keyof typeof stageColors]}`}
                            >
                              {project.stage}
                            </Badge>
                            {project.dependencies && project.dependencies.length > 0 && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                🔗 {project.dependencies.length} deps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${STATUS_COLORS[project.status as keyof typeof statusColors]}`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {project.owner || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${STAGE_COLORS[project.stage as keyof typeof stageColors]}`}
                      >
                        {project.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {project.dueDate ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(project.dueDate), 'MMM dd, yyyy')}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${RISK_COLORS[(project.risk || 'none') as keyof typeof riskColors]}`}
                      >
                        {project.risk || 'None'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[180px] text-sm text-gray-600 dark:text-gray-400">
                        {(project as any).description ? (
                          <div 
                            className="break-words line-clamp-3 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: (project as any).description }}
                            title={(project as any).description?.replace(/<[^>]*>/g, '') || ''}
                          />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="h-8 w-8 p-0"
                          title="Edit task"
                          data-testid={`edit-task-${project.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                          title="Delete task"
                          data-testid={`delete-task-${project.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      ) : (
        <div className="h-[calc(100vh-300px)]">
          <KanbanBoard
            columns={kanbanColumns}
            projects={filteredAndSortedProjects}
            teamMembers={teamMembers}
            onCardMove={handleCardMove}
            onCreateTask={(taskData) => createKanbanTaskMutation.mutate(taskData)}
            onEditStatuses={() => setIsEditStatusesOpen(true)}
          />
        </div>
      )}

      {/* Jira-Style Task Modal */}
      <JiraStyleTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(undefined);
        }}
        department={department}
        project={editingProject}
        onSubmit={editingProject ? handleUpdateTask as any : handleCreateTask as any}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Edit Statuses Modal */}
      <EditStatusesModal
        isOpen={isEditStatusesOpen}
        onClose={() => setIsEditStatusesOpen(false)}
        columns={kanbanColumns}
        onReorder={(reorderedColumns) => {
          // Handle reordering if needed
          console.log('Reorder columns:', reorderedColumns);
        }}
        onRename={(columnId, newName) => {
          renameKanbanColumnMutation.mutate({ columnId, newName });
        }}
        onDelete={(columnId) => {
          deleteKanbanColumnMutation.mutate(columnId);
        }}
        onAdd={(name, icon, color) => {
          addKanbanColumnMutation.mutate({ name, icon, color });
        }}
      />
    </div>
  );
}