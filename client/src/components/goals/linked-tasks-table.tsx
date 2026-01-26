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
import { Calendar, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Project } from "@shared/schema";
import { getStatusColor, getDepartmentColor } from "@/constants/colors";

interface LinkedTasksTableProps {
  tasks: Project[];
  isLoading: boolean;
  onNavigate: (path: string) => void;
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

export function LinkedTasksTable({ tasks, isLoading, onNavigate }: LinkedTasksTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Linked Tasks ({tasks.length})
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Tasks that contribute to this goal's progress
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead className="min-w-[200px]">Task</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Department</TableHead>
              <TableHead className="min-w-[120px]">Owner</TableHead>
              <TableHead className="min-w-[120px]">Due Date</TableHead>
              <TableHead className="min-w-[100px]">Progress</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks linked to this goal yet.
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
                  <TableCell>
                    <Badge variant="secondary" className={getDepartmentColor(task.department).className}>
                      {task.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.owner || '—'}</TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate(`/${task.department.toLowerCase().replace(' & ', '-').replace(' ', '-')}`)}
                      title="View in department"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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
