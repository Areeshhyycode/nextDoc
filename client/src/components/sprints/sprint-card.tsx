import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { type Sprint } from "@shared/schema";
import { useLocation } from "wouter";

interface SprintCardProps {
  sprint: Sprint;
}

const statusColors = {
  'Planning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export function SprintCard({ sprint }: SprintCardProps) {
  const [, setLocation] = useLocation();

  // Fetch sprint progress
  const { data: progress } = useQuery({
    queryKey: ["/api/sprints", sprint.id, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/sprints/${sprint.id}/progress`);
      if (!response.ok) throw new Error("Failed to fetch sprint progress");
      return response.json();
    }
  });

  const isActive = sprint.status === 'Active';
  const isCompleted = sprint.status === 'Completed';
  const daysLeft = isActive ? Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer" 
          onClick={() => setLocation(`/sprints/${sprint.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {sprint.name}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={statusColors[sprint.status as keyof typeof statusColors]}
            >
              {sprint.status}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{progress.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.progressPercentage)}`}
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{progress.completedTasks}/{progress.totalTasks} tasks</span>
              <span>{progress.completedEffort}/{progress.totalEffort} pts</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {format(new Date(sprint.startDate), 'MMM dd')} - {format(new Date(sprint.endDate), 'MMM dd')}
            </span>
          </div>
          {isActive && daysLeft > 0 && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{daysLeft}d left</span>
            </div>
          )}
        </div>

        {/* Team */}
        {sprint.teamMembers && sprint.teamMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-1">
              {sprint.teamMembers.slice(0, 3).map((member, index) => (
                <div
                  key={member}
                  className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300"
                  title={member}
                >
                  {member.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {sprint.teamMembers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  +{sprint.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {sprint.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {sprint.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="h-3 w-3" />
            <span>
              {isCompleted ? 'Completed' : 
               isActive ? 'In Progress' : 
               'Planning'}
            </span>
          </div>
          {sprint.teamMembers && (
            <div className="text-xs text-gray-500">
              {sprint.teamMembers.length} member{sprint.teamMembers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}