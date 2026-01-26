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
import { Calendar, Users, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Goal } from "@shared/schema";
import {
  getProgressColor,
  getProgressBadgeColor,
  getGoalStatusLabel,
  checkIsOverdueSimple
} from "./goal-utils";

interface GoalWithProgress extends Goal {
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
}

interface GoalsTableProps {
  goals: GoalWithProgress[];
  isLoading: boolean;
  searchQuery: string;
  onRowClick: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export function GoalsTable({
  goals,
  isLoading,
  searchQuery,
  onRowClick,
  onEdit,
  onDelete
}: GoalsTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="min-w-[200px]">Goal</TableHead>
                <TableHead className="min-w-[120px]">Owner</TableHead>
                <TableHead className="min-w-[150px]">Progress</TableHead>
                <TableHead className="min-w-[100px]">Tasks</TableHead>
                <TableHead className="min-w-[120px]">Target Date</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading goals...
                </TableCell>
              </TableRow>
            ) : goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No goals match your search." : "No goals yet. Click 'New Goal' to get started."}
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => {
                const isOverdue = checkIsOverdueSimple(goal.targetDate, goal.progressPercentage);

                return (
                  <TableRow
                    key={goal.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => onRowClick(goal.id)}
                    data-testid={`goal-row-${goal.id}`}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{goal.title}</div>
                        {goal.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                            {goal.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {goal.owner || "Unassigned"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(isOverdue, goal.progressPercentage)}`}
                              style={{ width: `${goal.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[35px]">
                            {goal.progressPercentage}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{goal.completedTasks}/{goal.totalTasks}</div>
                        <div className="text-gray-500">tasks</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {goal.targetDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getProgressBadgeColor(goal.progressPercentage, isOverdue)}
                      >
                        {getGoalStatusLabel(goal.progressPercentage, isOverdue)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(goal);
                          }}
                          data-testid={`edit-goal-${goal.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(goal.id);
                          }}
                          data-testid={`delete-goal-${goal.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Mobile Card View */}
    <div className="md:hidden space-y-3">
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          Loading goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
          {searchQuery ? "No goals match your search." : "No goals yet. Click 'New Goal' to get started."}
        </div>
      ) : (
        goals.map((goal) => {
          const isOverdue = checkIsOverdueSimple(goal.targetDate, goal.progressPercentage);

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
              onClick={() => onRowClick(goal.id)}
              data-testid={`goal-card-${goal.id}`}
            >
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={`${getProgressBadgeColor(goal.progressPercentage, isOverdue)} flex-shrink-0 text-xs`}
                >
                  {getGoalStatusLabel(goal.progressPercentage, isOverdue)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{goal.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(isOverdue, goal.progressPercentage)}`}
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-0.5">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Owner</span>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {goal.owner || "Unassigned"}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-0.5">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Target Date</span>
                  </div>
                  <div className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900 dark:text-white"} truncate`}>
                    {goal.targetDate ? format(new Date(goal.targetDate), 'MMM dd, yyyy') : '—'}
                  </div>
                </div>
              </div>

              {/* Tasks Counter */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{goal.completedTasks}/{goal.totalTasks}</span>
                  <span className="text-gray-500 dark:text-gray-400"> tasks completed</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(goal);
                    }}
                    data-testid={`edit-goal-${goal.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(goal.id);
                    }}
                    data-testid={`delete-goal-${goal.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
    </>
  );
}
