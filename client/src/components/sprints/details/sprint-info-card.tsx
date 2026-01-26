import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import type { Sprint } from "@shared/schema";

const sprintStatusColors = {
  'Planning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

interface SprintInfoCardProps {
  sprint: Sprint;
  daysLeft: number;
}

export function SprintInfoCard({ sprint, daysLeft }: SprintInfoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sprint.name}
            </h1>
            {sprint.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {sprint.description}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="secondary"
          className={sprintStatusColors[sprint.status as keyof typeof sprintStatusColors]}
        >
          {sprint.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {format(new Date(sprint.startDate), 'MMM dd')} - {format(new Date(sprint.endDate), 'MMM dd')}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Remaining</div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={`font-medium ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : ''}`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
               daysLeft === 0 ? 'Due today' :
               `${daysLeft} days left`}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Team Members</div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{sprint.teamMembers?.length || 0} members</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {format(new Date(sprint.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
