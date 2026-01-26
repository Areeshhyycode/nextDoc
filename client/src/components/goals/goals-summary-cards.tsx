import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";

interface GoalWithProgress {
  progressPercentage: number;
}

interface GoalsSummaryCardsProps {
  goals: GoalWithProgress[];
}

export function GoalsSummaryCards({ goals }: GoalsSummaryCardsProps) {
  const completed = goals.filter(g => g.progressPercentage === 100).length;
  const inProgress = goals.filter(g => g.progressPercentage > 0 && g.progressPercentage < 100).length;
  const notStarted = goals.filter(g => g.progressPercentage === 0).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</CardTitle>
          <Target className="h-4 w-4 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{goals.length}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
          <TrendingUp className="h-4 w-4 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{completed}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
          <TrendingUp className="h-4 w-4 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{inProgress}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</CardTitle>
          <TrendingUp className="h-4 w-4 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold text-gray-600">{notStarted}</div>
        </CardContent>
      </Card>
    </div>
  );
}
