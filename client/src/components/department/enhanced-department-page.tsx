import React, { useState } from "react";
import { type Project, type InsertProject } from "@shared/schema";
import { format } from "date-fns";
import { formatDisplayValue } from "@/lib/utils";
import { getDepartmentContextId } from "@shared/context-helpers";
import { JiraStyleTaskModal } from "./jira-style-task-modal";
import { KanbanBoard } from "@/components/teams/kanban-board";
import { EditStatusesModal } from "@/components/teams/edit-statuses-modal";
import { useDepartmentData } from "./hooks/useDepartmentData";
import { useProjectFilters } from "./hooks/useProjectFilters";
import { DepartmentToolbar } from "./components/DepartmentToolbar";
import { DepartmentTaskTable } from "./components/DepartmentTaskTable";

interface EnhancedDepartmentPageProps {
  department: string;
  title: string;
  description: string;
  color: string;
}

export function EnhancedDepartmentPage({ department, title, description }: EnhancedDepartmentPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isEditStatusesOpen, setIsEditStatusesOpen] = useState(false);

  const contextId = getDepartmentContextId(department);
  const storageKey = `column-widths-${contextId}`;

  const {
    projects,
    isLoading,
    teamMembers,
    kanbanColumns,
    currentView,
    handleViewChange,
    createMutation,
    updateMutation,
    deleteMutation,
    moveCardMutation,
    createKanbanTaskMutation,
    renameKanbanColumnMutation,
    deleteKanbanColumnMutation,
    addKanbanColumnMutation,
  } = useDepartmentData(department);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    riskFilter,
    setRiskFilter,
    ownerFilter,
    setOwnerFilter,
    dateRange,
    setDateRange,
    uniqueOwners,
    filteredAndSortedProjects,
    handleSort,
    hasActiveFilters,
  } = useProjectFilters(projects);

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
    setIsModalOpen(false);
  };

  const handleUpdateTask = (data: Partial<Project>) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
      setEditingProject(undefined);
      setIsModalOpen(false);
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

        <DepartmentToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          uniqueOwners={uniqueOwners}
          currentView={currentView}
          onViewChange={handleViewChange}
          onExport={handleExport}
          onAddTask={() => {
            setEditingProject(undefined);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Conditional Rendering: Table or Kanban */}
      {currentView === 'table' ? (
        <DepartmentTaskTable
          projects={filteredAndSortedProjects}
          storageKey={storageKey}
          hasActiveFilters={hasActiveFilters}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
