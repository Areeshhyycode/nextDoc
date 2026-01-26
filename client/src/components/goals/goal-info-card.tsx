import { Target, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Goal } from "@shared/schema";

interface GoalInfoCardProps {
  goal: Goal;
  isOverdue: boolean;
}

export function GoalInfoCard({ goal, isOverdue }: GoalInfoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner</div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{goal.owner || "Unassigned"}</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Date</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {goal.targetDate ? (
              <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                {isOverdue && <span className="ml-2 text-red-600">(Overdue)</span>}
              </span>
            ) : (
              <span>No target date set</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {format(new Date(goal.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
