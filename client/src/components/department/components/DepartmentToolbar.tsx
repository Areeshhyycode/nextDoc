import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { Plus, Search, Filter, Download } from "lucide-react";
import { ViewToggle } from "@/components/teams/view-toggle";

interface DepartmentToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  riskFilter: string;
  onRiskFilterChange: (value: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (value: DateRange | undefined) => void;
  uniqueOwners: (string | null)[];
  currentView: 'table' | 'kanban';
  onViewChange: (view: 'table' | 'kanban') => void;
  onExport: () => void;
  onAddTask: () => void;
}

export function DepartmentToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  riskFilter,
  onRiskFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  dateRange,
  onDateRangeChange,
  uniqueOwners,
  currentView,
  onViewChange,
  onExport,
  onAddTask,
}: DepartmentToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        {/* Search */}
        <div className="relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks and notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            data-testid="search-tasks"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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

          <Select value={riskFilter} onValueChange={onRiskFilterChange}>
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

          <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
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
            onChange={onDateRangeChange}
            placeholder="Select date range"
            className="w-[280px]"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <ViewToggle
          currentView={currentView}
          onViewChange={onViewChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          data-testid="export-tasks"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          onClick={onAddTask}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="add-task"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>
    </div>
  );
}
