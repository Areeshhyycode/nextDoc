import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Calendar, CheckCircle, Clock, AlertCircle, Zap, Users } from "lucide-react";
import { format } from "date-fns";
import type { Project } from "@shared/schema";
import { getStatusColor } from "@/constants/colors";

interface TeamMember {
  value: string;
  label: string;
}

interface SprintTasksTableProps {
  tasks: Project[];
  isLoading: boolean;
  selectedTeamMember: string;
  teamMembers: TeamMember[];
  sprintStatus: string;
  onTeamMemberChange: (value: string) => void;
  onAutoAssign: () => void;
  isAutoAssigning: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'In Progress':
    case 'Reviewing':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'Blocked':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
}

export function SprintTasksTable({
  tasks,
  isLoading,
  selectedTeamMember,
  teamMembers,
  sprintStatus,
  onTeamMemberChange,
  onAutoAssign,
  isAutoAssigning
}: SprintTasksTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sprint Tasks ({tasks.length})
              {selectedTeamMember !== "all" && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  for {selectedTeamMember}
                </span>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {selectedTeamMember === "all"
                ? "All tasks assigned to this sprint"
                : `Tasks assigned to ${selectedTeamMember} in this sprint`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <select
                value={selectedTeamMember}
                onChange={(e) => onTeamMemberChange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[160px]"
                data-testid="team-member-filter"
              >
                {teamMembers.map(member => (
                  <option key={member.value} value={member.value}>
                    {member.label}
                  </option>
                ))}
              </select>
            </div>

            {sprintStatus === 'Planning' && (
              <Button
                onClick={onAutoAssign}
                disabled={isAutoAssigning}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isAutoAssigning ? "Auto-Assigning..." : "Auto-Assign Tasks"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead className="min-w-[200px]">Task</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Owner</TableHead>
              <TableHead className="min-w-[100px]">Effort</TableHead>
              <TableHead className="min-w-[120px]">Due Date</TableHead>
              <TableHead className="min-w-[100px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {selectedTeamMember === "all"
                    ? "No tasks assigned to this sprint yet."
                    : `No tasks assigned to ${selectedTeamMember} in this sprint.`
                  }
                  {selectedTeamMember !== "all" && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTeamMemberChange("all")}
                        className="text-sm"
                      >
                        Show All Tasks
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <div className="max-w-[200px] truncate" title={task.task}>
                        {task.task}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.owner || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      {task.effortEstimate || 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.completionPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[35px]">
                        {task.completionPercentage || 0}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
