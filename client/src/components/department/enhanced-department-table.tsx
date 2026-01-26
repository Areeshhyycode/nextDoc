import React, { useState, useMemo } from "react";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Edit2, 
  Trash2, 
  Download,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { TaskModal } from "./task-modal";
import { format } from "date-fns";
import { type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { STATUS_COLORS, RISK_COLORS, STAGE_COLORS } from "@/constants/colors";
import { formatDisplayValue } from "@/lib/utils";

interface EnhancedDepartmentTableProps {
  department: string;
  title: string;
  description: string;
  color: string;
}

type SortField = 'task' | 'status' | 'owner' | 'stage' | 'dueDate' | 'risk' | 'description';
type SortDirection = 'asc' | 'desc';

export function EnhancedDepartmentTable({ department, title, description, color }: EnhancedDepartmentTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('task');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects', department],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/projects/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', department] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
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
        (project.notes && project.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ((project as any).description && (project as any).description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || (project.risk || '') === riskFilter;
      const matchesOwner = ownerFilter === 'all' || (project.owner || '') === ownerFilter;
      const matchesStage = stageFilter === 'all' || (project.stage || '') === stageFilter;

      return matchesSearch && matchesStatus && matchesRisk && matchesOwner && matchesStage;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dueDate') {
        aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
        bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, sortField, sortDirection, statusFilter, riskFilter, ownerFilter, stageFilter]);

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

  const handleExport = () => {
    const csvContent = [
      ['Task', 'Status', 'Owner', 'Stage', 'Due Date', 'Risk', 'Description', 'Notes'],
      ...filteredAndSortedProjects.map(project => [
        project.task,
        formatDisplayValue(project.status || ''),
        project.owner || '',
        formatDisplayValue(project.stage || ''),
        project.dueDate || '',
        formatDisplayValue(project.risk || ''),
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
    <div className="space-y-6 p-6">
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
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="design_approval_needed">Design Approval</SelectItem>
                  <SelectItem value="temporary_hold">Temporary Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[120px]" data-testid="filter-risk">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="w-[120px]" data-testid="filter-owner">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {uniqueOwners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
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
              className={color}
              data-testid="add-task"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <TableRow>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[200px]"
                  onClick={() => handleSort('task')}
                  data-testid="sort-task"
                >
                  <div className="flex items-center gap-2">
                    Task
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[120px]"
                  onClick={() => handleSort('status')}
                  data-testid="sort-status"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[120px]"
                  onClick={() => handleSort('owner')}
                  data-testid="sort-owner"
                >
                  <div className="flex items-center gap-2">
                    Owner
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[120px]"
                  onClick={() => handleSort('stage')}
                  data-testid="sort-stage"
                >
                  <div className="flex items-center gap-2">
                    Stage
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[120px]"
                  onClick={() => handleSort('dueDate')}
                  data-testid="sort-due-date"
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[100px]"
                  onClick={() => handleSort('risk')}
                  data-testid="sort-risk"
                >
                  <div className="flex items-center gap-2">
                    Risk
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[200px]"
                  onClick={() => handleSort('description')}
                  data-testid="sort-description"
                >
                  <div className="flex items-center gap-2">
                    Description
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="min-w-[150px]">Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' || riskFilter !== 'all' || ownerFilter !== 'all' 
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
                      <div className="max-w-[200px] truncate" title={project.task}>
                        {project.task}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={STATUS_COLORS[project.status as keyof typeof statusColors]}
                      >
                        {formatDisplayValue(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.owner || '—'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={STAGE_COLORS[project.stage as keyof typeof stageColors]}
                      >
                        {formatDisplayValue(project.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.dueDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(project.dueDate), 'MMM dd, yyyy')}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={RISK_COLORS[project.risk as keyof typeof riskColors]}
                      >
                        {formatDisplayValue(project.risk)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] text-sm text-gray-600 dark:text-gray-400">
                        {(project as any).description ? (
                          <div 
                            className="break-words line-clamp-3 leading-relaxed" 
                            title={(project as any).description}
                          >
                            {(project as any).description}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-gray-600 dark:text-gray-400" title={project.notes || ''}>
                        {project.notes || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          data-testid={`edit-task-${project.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
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

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(undefined);
        }}
        department={department}
        project={editingProject}
      />
    </div>
  );
}