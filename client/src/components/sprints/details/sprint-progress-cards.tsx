import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap } from "lucide-react";

interface SprintProgress {
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  totalEffort: number;
  completedEffort: number;
}

interface SprintProgressCardsProps {
  progress: SprintProgress | undefined;
  daysPassed: number;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-blue-500";
  if (percentage >= 25) return "bg-yellow-500";
  return "bg-gray-400";
}

export function SprintProgressCards({ progress, daysPassed }: SprintProgressCardsProps) {
  const percentage = progress?.progressPercentage || 0;
  const velocity = daysPassed > 0 ? Math.round((progress?.completedEffort || 0) / daysPassed) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <Target className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress?.totalTasks || 0}</div>
          <div className="text-sm text-gray-600">{progress?.completedTasks || 0} completed</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Story Points</CardTitle>
          <Zap className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress?.totalEffort || 0}</div>
          <div className="text-sm text-gray-600">{progress?.completedEffort || 0} completed</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Velocity</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{velocity}</div>
          <div className="text-sm text-gray-600">pts/day</div>
        </CardContent>
      </Card>
    </div>
  );
}
