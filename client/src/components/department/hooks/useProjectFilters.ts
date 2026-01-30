import { useState, useMemo } from "react";
import { type Project } from "@shared/schema";
import { type DateRange } from "@/components/ui/date-range-picker";

export type SortField = 'task' | 'status' | 'owner' | 'stage' | 'dueDate' | 'createdAt' | 'risk' | 'completionPercentage';
export type SortDirection = 'asc' | 'desc';

export function useProjectFilters(projects: Project[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('task');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const uniqueOwners = useMemo(() =>
    Array.from(new Set(projects.map(p => p.owner).filter(Boolean))), [projects]
  );

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = searchQuery === "" ||
        project.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.notes && project.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || project.risk === riskFilter;
      const matchesOwner = ownerFilter === 'all' || project.owner === ownerFilter;
      const matchesStage = stageFilter === 'all' || project.stage === stageFilter;

      const matchesDateRange = !dateRange?.from || (
        project.dueDate &&
        new Date(project.dueDate) >= dateRange.from &&
        (!dateRange.to || new Date(project.dueDate) <= dateRange.to)
      );

      return matchesSearch && matchesStatus && matchesRisk && matchesOwner && matchesStage && matchesDateRange;
    });

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

  const hasActiveFilters = searchQuery !== "" || statusFilter !== 'all' || riskFilter !== 'all' || ownerFilter !== 'all' || !!dateRange?.from;

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    riskFilter,
    setRiskFilter,
    ownerFilter,
    setOwnerFilter,
    stageFilter,
    setStageFilter,
    dateRange,
    setDateRange,
    uniqueOwners,
    filteredAndSortedProjects,
    handleSort,
    hasActiveFilters,
  };
}
