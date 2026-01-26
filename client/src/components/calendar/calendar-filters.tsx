import { Filter, Users } from "lucide-react";
import { DEPARTMENTS } from "@/constants/departments";
import { TEAM_MEMBERS_OPTIONS } from "@/constants/team-members";

interface CalendarFiltersProps {
  selectedDepartment: string;
  selectedTeamMember: string;
  onDepartmentChange: (value: string) => void;
  onTeamMemberChange: (value: string) => void;
  eventsCount: number;
}

export function CalendarFilters({
  selectedDepartment,
  selectedTeamMember,
  onDepartmentChange,
  onTeamMemberChange,
  eventsCount,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[140px]"
          data-testid="department-filter"
        >
          {DEPARTMENTS.map(dept => (
            <option key={dept.value} value={dept.value}>{dept.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-500" />
        <select
          value={selectedTeamMember}
          onChange={(e) => onTeamMemberChange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[160px]"
          data-testid="team-member-filter"
        >
          {TEAM_MEMBERS_OPTIONS.map(member => (
            <option key={member.value} value={member.value}>{member.label}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {eventsCount} scheduled task{eventsCount !== 1 ? 's' : ''}
        {selectedTeamMember !== "all" && (
          <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
            for {selectedTeamMember}
          </span>
        )}
      </div>
    </div>
  );
}
